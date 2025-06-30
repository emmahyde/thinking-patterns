import { BaseToolServer } from '../base/BaseToolServer.js';
import { SequentialThoughtSchema, SequentialThoughtData, SequentialThoughtResponseSchema, SequentialThoughtResponseData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';
import { SessionManager, SequentialThinkingSessionData } from '../services/SessionManager.js';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Sequential Thinking Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 * Includes Redis session management for persistent state across interactions
 */
export class SequentialThinkingServer extends BaseToolServer<SequentialThoughtData, any> {
  public sessionManager: SessionManager | null = null;

  constructor() {
    super(SequentialThoughtSchema);
    this.initializeSessionManager();
  }

  private initializeSessionManager(): void {
    try {
      // Check if Redis connection is available
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redis = new Redis(redisUrl);
      const redisAdapter = new RedisStorageAdapter(redis);
      this.sessionManager = new SessionManager(redisAdapter);
    } catch (error) {
      console.warn('Redis not available, session persistence disabled:', error);
      this.sessionManager = null;
    }
  }

  protected handle(validInput: SequentialThoughtData): SequentialThoughtResponseData {
    // For simplicity, return synchronous result without session persistence
    const result = {
      thoughtNumber: validInput.thoughtNumber,
      totalThoughts: validInput.totalThoughts,
      nextThoughtNeeded: validInput.nextThoughtNeeded,
      thought: validInput.thought,
      isRevision: validInput.isRevision || false,
      revisesThought: validInput.revisesThought,
      branchFromThought: validInput.branchFromThought,
      branchId: validInput.branchId,
      needsMoreThoughts: validInput.needsMoreThoughts,
      currentStep: validInput.currentStep,
      previousSteps: validInput.previousSteps,
      remainingSteps: validInput.remainingSteps,
      toolUsageHistory: validInput.toolUsageHistory,
      status: 'success',
      hasCurrentStep: !!validInput.currentStep,
      hasPreviousSteps: !!validInput.previousSteps && validInput.previousSteps.length > 0,
      hasRemainingSteps: !!validInput.remainingSteps && validInput.remainingSteps.length > 0,
      hasToolUsageHistory: !!validInput.toolUsageHistory && validInput.toolUsageHistory.length > 0,
      stage: this.determineStage(validInput.thoughtNumber, validInput.totalThoughts),
      timestamp: new Date().toISOString(),
      sessionId: validInput.sessionId || `sync_session_${Date.now()}`,
      sessionPersisted: false
    };

    const response = SequentialThoughtResponseSchema.parse(result);

    return response;
  }

  /**
   * Standardized process method for sequential thinking with Redis session persistence
   * @param validInput - Validated thought data
   * @returns Processed thought result
   */
  public async process(validInput: SequentialThoughtData): Promise<any> {
    // Handle session management if available
    let sessionData: SequentialThinkingSessionData | null = null;
    let sessionId: string | undefined;

    // Extract or generate session ID
    if (validInput.sessionId) {
      sessionId = validInput.sessionId;
    } else if (validInput.thoughtNumber > 1) {
      // For subsequent thoughts, try to find existing session
      sessionId = this.generateSessionId(validInput);
    } else {
      // For first thought, create new session
      sessionId = this.generateSessionId(validInput);
    }

    if (this.sessionManager && sessionId) {
      try {
        // Try to get existing session
        sessionData = await this.sessionManager.getSequentialThinkingSession(sessionId);

        if (!sessionData && validInput.thoughtNumber === 1) {
          // Create new session for first thought
          await this.sessionManager.createSession(sessionId, 'sequential_thinking');
          sessionData = await this.sessionManager.getSequentialThinkingSession(sessionId);
        }

        if (sessionData) {
          // Update session with current thought
          sessionData.thoughtHistory.push(validInput);
          sessionData.currentThought = validInput;

          // Handle branching
          if (validInput.branchId && validInput.branchFromThought) {
            if (!sessionData.branches[validInput.branchId]) {
              sessionData.branches[validInput.branchId] = [];
            }
            sessionData.branches[validInput.branchId].push(validInput);
          }

          // Save updated session
          await this.sessionManager.updateSequentialThinkingSession(sessionId, sessionData);
        }
      } catch (error) {
        console.warn('Session management error:', error);
      }
    }

    // Format output using boxed utility
    const formattedOutput = this.formatThoughtOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const result = {
      thoughtNumber: validInput.thoughtNumber,
      totalThoughts: validInput.totalThoughts,
      nextThoughtNeeded: validInput.nextThoughtNeeded,
      thought: validInput.thought,
      isRevision: validInput.isRevision || false,
      revisesThought: validInput.revisesThought,
      branchFromThought: validInput.branchFromThought,
      branchId: validInput.branchId,
      needsMoreThoughts: validInput.needsMoreThoughts,
      currentStep: validInput.currentStep,
      previousSteps: validInput.previousSteps,
      remainingSteps: validInput.remainingSteps,
      toolUsageHistory: validInput.toolUsageHistory,
      status: 'success',
      hasCurrentStep: !!validInput.currentStep,
      hasPreviousSteps: !!validInput.previousSteps && validInput.previousSteps.length > 0,
      hasRemainingSteps: !!validInput.remainingSteps && validInput.remainingSteps.length > 0,
      hasToolUsageHistory: !!validInput.toolUsageHistory && validInput.toolUsageHistory.length > 0,
      stage: this.determineStage(validInput.thoughtNumber, validInput.totalThoughts),
      timestamp: new Date().toISOString(),
      sessionId: sessionId, // Include session ID in response
      sessionPersisted: !!sessionData, // Indicate if session was persisted
    };

    // Include session context if available
    if (sessionData) {
      (result as any).sessionContext = {
        thoughtCount: sessionData.thoughtHistory.length,
        totalThoughtsInSession: sessionData.thoughtHistory.length,
        hasBranches: Object.keys(sessionData.branches).length > 0,
        branches: Object.keys(sessionData.branches),
        sessionCreated: sessionData.createdAt,
        lastAccessed: sessionData.lastAccessedAt
      };
    }

    // --- NEW: Include full session content ---
    (result as any).session = sessionData || null;

    return result;
  }

  /**
   * Generate a session ID for sequential thinking based on input characteristics
   * This helps group related thoughts together when sessionId is not provided
   */
  private generateSessionId(input: SequentialThoughtData): string {
    // Use a combination of thought content hash and timestamp for session grouping
    const contentHash = this.hashString(input.thought.substring(0, 50));
    const datePrefix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `seq_thinking_${datePrefix}_${contentHash}`;
  }

  /**
   * Backward compatibility method for tests
   */
  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; data?: any; isError?: boolean } {
    try {
      const validatedInput = this.validate(input);
      const result = {
        thoughtNumber: validatedInput.thoughtNumber,
        totalThoughts: validatedInput.totalThoughts,
        nextThoughtNeeded: validatedInput.nextThoughtNeeded,
        thought: validatedInput.thought,
        isRevision: validatedInput.isRevision || false,
        revisesThought: validatedInput.revisesThought,
        branchFromThought: validatedInput.branchFromThought,
        branchId: validatedInput.branchId,
        needsMoreThoughts: validatedInput.needsMoreThoughts,
        currentStep: validatedInput.currentStep,
        previousSteps: validatedInput.previousSteps,
        remainingSteps: validatedInput.remainingSteps,
        toolUsageHistory: validatedInput.toolUsageHistory,
        status: 'success',
        hasCurrentStep: !!validatedInput.currentStep,
        hasPreviousSteps: !!validatedInput.previousSteps && validatedInput.previousSteps.length > 0,
        hasRemainingSteps: !!validatedInput.remainingSteps && validatedInput.remainingSteps.length > 0,
        hasToolUsageHistory: !!validatedInput.toolUsageHistory && validatedInput.toolUsageHistory.length > 0,
        stage: this.determineStage(validatedInput.thoughtNumber, validatedInput.totalThoughts),
        timestamp: new Date().toISOString(),
        sessionPersisted: false
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }],
        data: validatedInput
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed',
            timestamp: new Date().toISOString()
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  /**
   * Simple hash function for generating consistent session IDs
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Retrieve session history for a given session ID
   */
  public async getSessionHistory(sessionId: string): Promise<SequentialThoughtData[]> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getSequentialThinkingSession(sessionId);
      return sessionData ? sessionData.thoughtHistory : [];
    } catch (error) {
      console.warn('Error retrieving session history:', error);
      return [];
    }
  }

  /**
   * Retrieve all branches for a session
   */
  public async getSessionBranches(sessionId: string): Promise<Record<string, SequentialThoughtData[]>> {
    if (!this.sessionManager) {
      return {};
    }

    try {
      const sessionData = await this.sessionManager.getSequentialThinkingSession(sessionId);
      return sessionData ? sessionData.branches : {};
    } catch (error) {
      console.warn('Error retrieving session branches:', error);
      return {};
    }
  }

  /**
   * Clear a specific session
   */
  public async clearSession(sessionId: string): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      await this.sessionManager.clearSession(sessionId);
      return true;
    } catch (error) {
      console.warn('Error clearing session:', error);
      return false;
    }
  }


  private formatThoughtOutput(data: SequentialThoughtData): string {
    const sections: Record<string, string | string[]> = {
      'Thought': `${data.thoughtNumber}/${data.totalThoughts}`,
      'Content': data.thought
    };

    if (data.isRevision && data.revisesThought) {
      sections['Type'] = `REVISION (revising thought ${data.revisesThought})`;
    } else if (data.branchFromThought && data.branchId) {
      sections['Type'] = `BRANCH (from thought ${data.branchFromThought}, ID: ${data.branchId})`;
    } else {
      sections['Type'] = 'SEQUENTIAL';
    }

    // Current step information
    if (data.currentStep) {
      const step = data.currentStep;
      sections['Current Step'] = [
        `Description: ${step.stepDescription}`,
        `Expected Outcome: ${step.expectedOutcome}`,
        ...(step.estimatedDuration ? [`Duration: ${step.estimatedDuration}`] : []),
        ...(step.complexityLevel ? [`Complexity: ${step.complexityLevel.toUpperCase()}`] : [])
      ];

      if (step.recommendedTools.length > 0) {
        sections['Recommended Tools'] = step.recommendedTools.map(tool =>
          `• ${tool.toolName} (${(tool.confidence * 100).toFixed(0)}%): ${tool.rationale}`
        );
      }

      if (step.nextStepConditions.length > 0) {
        sections['Next Step Conditions'] = step.nextStepConditions.map(condition => `• ${condition}`);
      }
    }

    // Previous steps
    if (data.previousSteps && data.previousSteps.length > 0) {
      sections['Previous Steps'] = data.previousSteps.map((step, index) =>
        `${index + 1}. ${step.stepDescription}`
      );
    }

    // Remaining steps
    if (data.remainingSteps && data.remainingSteps.length > 0) {
      sections['Remaining Steps'] = data.remainingSteps.map(step => `• ${step}`);
    }

    // Tool usage history
    if (data.toolUsageHistory && data.toolUsageHistory.length > 0) {
      sections['Tool Usage History'] = data.toolUsageHistory.map(usage => {
        const effectiveness = usage.effectivenessScore ? ` (${(usage.effectivenessScore * 100).toFixed(0)}%)` : '';
        return `• ${usage.toolName} at ${usage.usedAt}${effectiveness}`;
      });
    }

    // Progress information
    const progress = Math.round((data.thoughtNumber / data.totalThoughts) * 100);
    sections['Progress'] = `${progress}% (${data.thoughtNumber}/${data.totalThoughts})`;

    if (data.needsMoreThoughts) {
      sections['Status'] = 'MORE THOUGHTS NEEDED';
    } else if (data.nextThoughtNeeded) {
      sections['Status'] = 'NEXT THOUGHT NEEDED';
    } else {
      sections['Status'] = 'SEQUENCE COMPLETE';
    }

    return boxed('💭 Sequential Thinking', sections);
  }

  private determineStage(thoughtNumber: number, totalThoughts: number): string {
    // Handle edge cases first
    if (totalThoughts === 1) return 'final'; // Single thought is always final
    if (thoughtNumber === 1 && totalThoughts > 1) return 'initial';
    if (thoughtNumber === totalThoughts) return 'final';

    // For sequences with 2 thoughts, first is initial, second is final
    if (totalThoughts === 2) {
      return thoughtNumber === 1 ? 'initial' : 'final';
    }

    // For longer sequences, use proportional logic
    const progress = thoughtNumber / totalThoughts;
    if (progress <= 0.33) return 'initial';
    if (progress >= 0.67) return 'final';
    return 'middle';
  }
}
