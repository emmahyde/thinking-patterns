import { BaseToolServer } from '../base/BaseToolServer.js';
import { ScientificMethodSchema, ScientificMethodData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';
import { SessionManager, ScientificMethodSessionData } from '../services/SessionManager.js';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Scientific Method Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 * Includes Redis session management for persistent scientific inquiries
 */
export class ScientificMethodServer extends BaseToolServer<ScientificMethodData, any> {
  public sessionManager: SessionManager | null = null;

  constructor() {
    super(ScientificMethodSchema);
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

  protected async handle(validInput: ScientificMethodData): Promise<any> {
    return await this.process(validInput);
  }

  /**
   * Synchronous handle method for backward compatibility with run()
   */
  protected handleSync(validInput: ScientificMethodData): any {
    const result = {
      inquiryId: validInput.inquiryId,
      stage: validInput.stage,
      iteration: validInput.iteration,
      nextStageNeeded: validInput.nextStageNeeded,
      observation: validInput.observation,
      question: validInput.question,
      hypothesis: validInput.hypothesis,
      experiment: validInput.experiment,
      analysis: validInput.analysis,
      conclusion: validInput.conclusion,
      status: 'success',
      hasObservation: !!validInput.observation,
      hasQuestion: !!validInput.question,
      hasHypothesis: !!validInput.hypothesis,
      hasExperiment: !!validInput.experiment,
      hasAnalysis: !!validInput.analysis,
      hasConclusion: !!validInput.conclusion,
      timestamp: new Date().toISOString(),
      sessionPersisted: false,
    };

    return result;
  }

  /**
   * Standardized process method for scientific method with Redis session persistence
   * @param validInput - Validated scientific method data
   * @returns Processed scientific method result
   */
  public async process(validInput: ScientificMethodData): Promise<any> {
    // Handle session management if available
    let sessionData: ScientificMethodSessionData | null = null;
    const inquiryId = validInput.inquiryId;

    if (this.sessionManager && inquiryId) {
      try {
        // Try to get existing session
        sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);

        if (!sessionData) {
          // Create new session
          await this.sessionManager.createSession(inquiryId, 'scientific_method');
          sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
        }

        if (sessionData) {
          // Update session with current data
          sessionData.inquiryData = validInput;

          // Add to stage history
          sessionData.stageHistory.push({
            stage: validInput.stage,
            timestamp: new Date(),
            data: {
              iteration: validInput.iteration,
              observation: validInput.observation,
              question: validInput.question,
              analysis: validInput.analysis,
              conclusion: validInput.conclusion
            }
          });

          // Track hypothesis evolution
          if (validInput.hypothesis) {
            const existingHypothesis = sessionData.hypothesesHistory.find(
              h => h.hypothesisId === validInput.hypothesis!.hypothesisId
            );
            if (!existingHypothesis) {
              sessionData.hypothesesHistory.push({
                ...validInput.hypothesis,
                timestamp: new Date(),
                iteration: validInput.iteration,
                stage: validInput.stage
              });
            }
          }

          // Save updated session
          await this.sessionManager.updateScientificMethodSession(inquiryId, sessionData);
        }
      } catch (error) {
        console.warn('Session management error:', error);
      }
    }
    // Format output using boxed utility
    const formattedOutput = this.formatScientificOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const result = {
      inquiryId: validInput.inquiryId,
      stage: validInput.stage,
      iteration: validInput.iteration,
      nextStageNeeded: validInput.nextStageNeeded,
      observation: validInput.observation,
      question: validInput.question,
      hypothesis: validInput.hypothesis,
      experiment: validInput.experiment,
      analysis: validInput.analysis,
      conclusion: validInput.conclusion,
      status: 'success',
      hasObservation: !!validInput.observation,
      hasQuestion: !!validInput.question,
      hasHypothesis: !!validInput.hypothesis,
      hasExperiment: !!validInput.experiment,
      hasAnalysis: !!validInput.analysis,
      hasConclusion: !!validInput.conclusion,
      timestamp: new Date().toISOString(),
      sessionPersisted: !!sessionData, // Indicate if session was persisted
    };

    // Include session context if available
    if (sessionData) {
      (result as any).sessionContext = {
        stageCount: sessionData.stageHistory.length,
        totalStages: sessionData.stageHistory.length,
        stageSequence: sessionData.stageHistory.map(s => s.stage),
        hypothesesTracked: sessionData.hypothesesHistory.length,
        currentIteration: validInput.iteration,
        sessionCreated: sessionData.createdAt,
        lastAccessed: sessionData.lastAccessedAt,
        inquiryProgress: {
          hasObservation: !!sessionData.inquiryData.observation,
          hasQuestion: !!sessionData.inquiryData.question,
          hasHypothesis: !!sessionData.inquiryData.hypothesis,
          hasExperiment: !!sessionData.inquiryData.experiment,
          hasAnalysis: !!sessionData.inquiryData.analysis,
          hasConclusion: !!sessionData.inquiryData.conclusion
        }
      };
    }

    // --- NEW: Include full session content ---
    (result as any).session = sessionData || null;

    return result;
  }

  // Backward compatibility method for tests
  public processScientificMethod(input: unknown): { content: Array<{ type: string; text: string }>; data?: any; isError?: boolean } {
    try {
      const validatedInput = this.validate(input);
      const response = this.run(input);

      return {
        ...response,
        data: validatedInput  // Add the validated input data for test compatibility
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  private formatScientificOutput(data: ScientificMethodData): string {
    const sections: Record<string, string | string[]> = {
      'Inquiry ID': data.inquiryId,
      'Stage': data.stage.toUpperCase(),
      'Iteration': data.iteration.toString()
    };

    // Observation
    if (data.observation) {
      sections['Observation'] = data.observation;
    }

    // Question
    if (data.question) {
      sections['Research Question'] = data.question;
    }

    // Hypothesis
    if (data.hypothesis) {
      const h = data.hypothesis;
      sections['Hypothesis'] = [
        `Statement: ${h.statement}`,
        `Domain: ${h.domain}`,
        `Status: ${h.status.toUpperCase()}`,
        `Confidence: ${(h.confidence * 100).toFixed(1)}%`,
        `ID: ${h.hypothesisId}`
      ];

      if (h.variables.length > 0) {
        sections['Variables'] = h.variables.map(variable =>
          `• ${variable.name} (${variable.type})${variable.operationalization ? ': ' + variable.operationalization : ''}`
        );
      }

      if (h.assumptions.length > 0) {
        sections['Assumptions'] = h.assumptions.map(assumption => `• ${assumption}`);
      }

      if (h.alternativeTo && h.alternativeTo.length > 0) {
        sections['Alternative To'] = h.alternativeTo.map(alt => `• ${alt}`);
      }
    }

    // Experiment
    if (data.experiment) {
      const e = data.experiment;
      sections['Experiment'] = [
        `Design: ${e.design}`,
        `Methodology: ${e.methodology}`,
        `ID: ${e.experimentId}`,
        `Hypothesis ID: ${e.hypothesisId}`
      ];

      if (e.predictions.length > 0) {
        sections['Predictions'] = e.predictions.map(pred =>
          `• If ${pred.if}, then ${pred.then}${pred.else ? `, else ${pred.else}` : ''}`
        );
      }

      if (e.controlMeasures.length > 0) {
        sections['Control Measures'] = e.controlMeasures.map(measure => `• ${measure}`);
      }

      if (e.results) {
        sections['Results'] = e.results;
      }

      if (e.outcomeMatched !== undefined) {
        sections['Outcome Matched Prediction'] = e.outcomeMatched ? 'YES' : 'NO';
      }

      if (e.unexpectedObservations && e.unexpectedObservations.length > 0) {
        sections['Unexpected Observations'] = e.unexpectedObservations.map(obs => `• ${obs}`);
      }

      if (e.limitations && e.limitations.length > 0) {
        sections['Limitations'] = e.limitations.map(limitation => `• ${limitation}`);
      }

      if (e.nextSteps && e.nextSteps.length > 0) {
        sections['Next Steps'] = e.nextSteps.map(step => `• ${step}`);
      }
    }

    // Analysis
    if (data.analysis) {
      sections['Analysis'] = data.analysis;
    }

    // Conclusion
    if (data.conclusion) {
      sections['Conclusion'] = data.conclusion;
    }

    return boxed('🔬 Scientific Method', sections);
  }

  /**
   * Retrieve stage history for a given inquiry ID
   */
  public async getStageHistory(inquiryId: string): Promise<Array<{ stage: string; timestamp: Date; data: any }>> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
      return sessionData ? sessionData.stageHistory : [];
    } catch (error) {
      console.warn('Error retrieving stage history:', error);
      return [];
    }
  }

  /**
   * Retrieve hypothesis history for a given inquiry ID
   */
  public async getHypothesesHistory(inquiryId: string): Promise<any[]> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
      return sessionData ? sessionData.hypothesesHistory : [];
    } catch (error) {
      console.warn('Error retrieving hypotheses history:', error);
      return [];
    }
  }

  /**
   * Retrieve current inquiry data
   */
  public async getInquiryData(inquiryId: string): Promise<ScientificMethodData | null> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      const sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
      return sessionData ? sessionData.inquiryData : null;
    } catch (error) {
      console.warn('Error retrieving inquiry data:', error);
      return null;
    }
  }

  /**
   * Clear a specific inquiry session
   */
  public async clearInquiry(inquiryId: string): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      await this.sessionManager.clearSession(inquiryId);
      return true;
    } catch (error) {
      console.warn('Error clearing inquiry:', error);
      return false;
    }
  }

  /**
   * Add a hypothesis to an existing inquiry
   */
  public async addHypothesis(inquiryId: string, hypothesis: any): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      const sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
      if (sessionData) {
        sessionData.hypothesesHistory.push({
          ...hypothesis,
          timestamp: new Date()
        });
        await this.sessionManager.updateScientificMethodSession(inquiryId, sessionData);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error adding hypothesis:', error);
      return false;
    }
  }

  /**
   * Get inquiry progress summary
   */
  public async getInquiryProgress(inquiryId: string): Promise<any> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      const sessionData = await this.sessionManager.getScientificMethodSession(inquiryId);
      if (sessionData) {
        return {
          stages: sessionData.stageHistory.map(s => s.stage),
          currentStage: sessionData.inquiryData.stage,
          iteration: sessionData.inquiryData.iteration,
          hypothesesCount: sessionData.hypothesesHistory.length,
          completionStatus: {
            hasObservation: !!sessionData.inquiryData.observation,
            hasQuestion: !!sessionData.inquiryData.question,
            hasHypothesis: !!sessionData.inquiryData.hypothesis,
            hasExperiment: !!sessionData.inquiryData.experiment,
            hasAnalysis: !!sessionData.inquiryData.analysis,
            hasConclusion: !!sessionData.inquiryData.conclusion
          }
        };
      }
      return null;
    } catch (error) {
      console.warn('Error getting inquiry progress:', error);
      return null;
    }
  }
}
