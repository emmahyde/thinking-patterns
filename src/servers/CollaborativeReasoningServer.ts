import { BaseToolServer } from '../base/BaseToolServer.js';
import { CollaborativeReasoningSchema, CollaborativeReasoningData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';
import { SessionManager, CollaborativeReasoningSessionData } from '../services/SessionManager.js';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Collaborative Reasoning Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 * Includes Redis session management for persistent collaborative sessions
 */
export class CollaborativeReasoningServer extends BaseToolServer<CollaborativeReasoningData, any> {
  private sessionManager: SessionManager | null = null;

  constructor() {
    super(CollaborativeReasoningSchema);
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

  protected async handle(validInput: CollaborativeReasoningData): Promise<any> {
    return await this.process(validInput);
  }

  /**
   * Synchronous handle method for backward compatibility with run()
   */
  protected handleSync(validInput: CollaborativeReasoningData): any {
    // Create a synchronous version of the result without session management
    const result = {
      topic: validInput.topic,
      sessionId: validInput.sessionId,
      stage: validInput.stage,
      activePersonaId: validInput.activePersonaId,
      nextPersonaId: validInput.nextPersonaId,
      iteration: validInput.iteration,
      nextContributionNeeded: validInput.nextContributionNeeded,
      personas: validInput.personas,
      contributions: validInput.contributions,
      consensusPoints: validInput.consensusPoints,
      disagreements: validInput.disagreements,
      keyInsights: validInput.keyInsights,
      openQuestions: validInput.openQuestions,
      finalRecommendation: validInput.finalRecommendation,
      suggestedContributionTypes: validInput.suggestedContributionTypes,
      status: 'success',
      personaCount: validInput.personas.length,
      contributionCount: validInput.contributions.length,
      consensusPointCount: validInput.consensusPoints?.length ?? 0,
      hasDisagreements: !!validInput.disagreements && validInput.disagreements.length > 0,
      hasKeyInsights: !!validInput.keyInsights && validInput.keyInsights.length > 0,
      hasOpenQuestions: !!validInput.openQuestions && validInput.openQuestions.length > 0,
      hasFinalRecommendation: !!validInput.finalRecommendation,
      hasSuggestedContributionTypes: !!validInput.suggestedContributionTypes && validInput.suggestedContributionTypes.length > 0,
      timestamp: new Date().toISOString(),
      sessionPersisted: false,
    };

    return result;
  }

  /**
   * Standardized process method for collaborative reasoning with Redis session persistence
   * @param validInput - Validated collaborative reasoning data
   * @returns Processed collaborative reasoning result
   */
  public async process(validInput: CollaborativeReasoningData): Promise<any> {
    // Handle session management if available
    let sessionData: CollaborativeReasoningSessionData | null = null;
    const sessionId = validInput.sessionId;

    if (this.sessionManager && sessionId) {
      try {
        // Try to get existing session
        sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
        
        if (!sessionData) {
          // Create new session
          await this.sessionManager.createSession(sessionId, 'collaborative_reasoning');
          sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
        }
        
        if (sessionData) {
          // Update session with current data
          sessionData.sessionData = validInput;
          
          // Add to contribution history if this is a new contribution
          if (validInput.contributions && validInput.contributions.length > 0) {
            const latestContribution = validInput.contributions[validInput.contributions.length - 1];
            // Check if this contribution is new
            const existingContribution = sessionData.contributionHistory.find(
              c => c.personaId === latestContribution.personaId && 
                   c.content === latestContribution.content &&
                   c.type === latestContribution.type
            );
            if (!existingContribution) {
              sessionData.contributionHistory.push({
                ...latestContribution,
                timestamp: new Date(),
                iteration: validInput.iteration
              });
            }
          }
          
          // Update stage progress
          sessionData.stageProgress[validInput.stage] = true;
          
          // Save updated session
          await this.sessionManager.updateCollaborativeReasoningSession(sessionId, sessionData);
        }
      } catch (error) {
        console.warn('Session management error:', error);
      }
    }
    // Format output using boxed utility
    const formattedOutput = this.formatCollaborativeOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const result = {
      topic: validInput.topic,
      sessionId: validInput.sessionId,
      stage: validInput.stage,
      activePersonaId: validInput.activePersonaId,
      nextPersonaId: validInput.nextPersonaId,
      iteration: validInput.iteration,
      nextContributionNeeded: validInput.nextContributionNeeded,
      personas: validInput.personas,
      contributions: validInput.contributions,
      consensusPoints: validInput.consensusPoints,
      disagreements: validInput.disagreements,
      keyInsights: validInput.keyInsights,
      openQuestions: validInput.openQuestions,
      finalRecommendation: validInput.finalRecommendation,
      suggestedContributionTypes: validInput.suggestedContributionTypes,
      status: 'success',
      personaCount: validInput.personas.length,
      contributionCount: validInput.contributions.length,
      consensusPointCount: validInput.consensusPoints?.length ?? 0,
      hasDisagreements: !!validInput.disagreements && validInput.disagreements.length > 0,
      hasKeyInsights: !!validInput.keyInsights && validInput.keyInsights.length > 0,
      hasOpenQuestions: !!validInput.openQuestions && validInput.openQuestions.length > 0,
      hasFinalRecommendation: !!validInput.finalRecommendation,
      hasSuggestedContributionTypes: !!validInput.suggestedContributionTypes && validInput.suggestedContributionTypes.length > 0,
      timestamp: new Date().toISOString(),
      sessionPersisted: !!sessionData, // Indicate if session was persisted
    };

    // Include session context if available
    if (sessionData) {
      (result as any).sessionContext = {
        totalContributions: sessionData.contributionHistory.length,
        stagesCompleted: Object.keys(sessionData.stageProgress).filter(stage => sessionData.stageProgress[stage]),
        stageCount: Object.keys(sessionData.stageProgress).length,
        sessionCreated: sessionData.createdAt,
        lastAccessed: sessionData.lastAccessedAt,
        currentStage: validInput.stage,
        stageProgress: sessionData.stageProgress
      };
    }

    return result;
  }

  private formatCollaborativeOutput(data: CollaborativeReasoningData): string {
    const sections: Record<string, string | string[]> = {
      'Topic': data.topic,
      'Stage': data.stage.replace('-', ' ').toUpperCase(),
      'Session': data.sessionId,
      'Iteration': data.iteration.toString()
    };

    // Active persona
    const activePersona = data.personas.find(p => p.id === data.activePersonaId);
    if (activePersona) {
      sections['Active Persona'] = `${activePersona.name} (${activePersona.expertise.join(', ')})`;
    }

    // Personas summary
    if (data.personas.length > 0) {
      sections['Participants'] = data.personas.map(p => `• ${p.name}: ${p.expertise.join(', ')}`);
    }

    // Recent contributions
    if (data.contributions.length > 0) {
      const recentContributions = data.contributions.slice(-3);
      sections['Recent Contributions'] = recentContributions.map(c => {
        const persona = data.personas.find(p => p.id === c.personaId);
        return `• ${persona?.name || c.personaId} (${c.type}): ${c.content.slice(0, 80)}${c.content.length > 80 ? '...' : ''}`;
      });
    }

    // Consensus points
    if (data.consensusPoints && data.consensusPoints.length > 0) {
      sections['Consensus Points'] = data.consensusPoints.map(point => `• ${point}`);
    }

    // Key insights
    if (data.keyInsights && data.keyInsights.length > 0) {
      sections['Key Insights'] = data.keyInsights.map(insight => `• ${insight}`);
    }

    // Open questions
    if (data.openQuestions && data.openQuestions.length > 0) {
      sections['Open Questions'] = data.openQuestions.map(question => `• ${question}`);
    }

    // Final recommendation
    if (data.finalRecommendation) {
      sections['Final Recommendation'] = data.finalRecommendation;
    }

    // Next contribution suggestion
    if (data.suggestedContributionTypes && data.suggestedContributionTypes.length > 0) {
      sections['Suggested Next Contributions'] = data.suggestedContributionTypes.map(type => `• ${type}`);
    }

    return boxed('🤝 Collaborative Reasoning', sections);
  }

  /**
   * Retrieve session history for a given session ID
   */
  public async getSessionHistory(sessionId: string): Promise<any[]> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
      return sessionData ? sessionData.contributionHistory : [];
    } catch (error) {
      console.warn('Error retrieving session history:', error);
      return [];
    }
  }

  /**
   * Retrieve current session data
   */
  public async getSessionData(sessionId: string): Promise<CollaborativeReasoningData | null> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      const sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
      return sessionData ? sessionData.sessionData : null;
    } catch (error) {
      console.warn('Error retrieving session data:', error);
      return null;
    }
  }

  /**
   * Get session stage progress
   */
  public async getStageProgress(sessionId: string): Promise<Record<string, boolean>> {
    if (!this.sessionManager) {
      return {};
    }

    try {
      const sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
      return sessionData ? sessionData.stageProgress : {};
    } catch (error) {
      console.warn('Error retrieving stage progress:', error);
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

  /**
   * Add a contribution to an existing session
   */
  public async addContribution(sessionId: string, contribution: any): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      const sessionData = await this.sessionManager.getCollaborativeReasoningSession(sessionId);
      if (sessionData) {
        sessionData.contributionHistory.push({
          ...contribution,
          timestamp: new Date()
        });
        await this.sessionManager.updateCollaborativeReasoningSession(sessionId, sessionData);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error adding contribution:', error);
      return false;
    }
  }
}
