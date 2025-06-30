import { BaseToolServer } from '../base/BaseToolServer.js';
import { DomainModelingSchema, DomainModelingData, DomainRuleData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';
import { SessionManager, DomainModelingSessionData } from '../services/SessionManager.js';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Domain Modeling Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 * Includes Redis session management for persistent domain modeling sessions
 */
export class DomainModelingServer extends BaseToolServer<DomainModelingData, any> {
  private sessionManager: SessionManager | null = null;

  constructor() {
    super(DomainModelingSchema);
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

  protected async handle(validInput: DomainModelingData): Promise<any> {
    return await this.process(validInput);
  }

  /**
   * Standardized process method for domain modeling with Redis session persistence
   * @param validInput - Validated domain modeling data
   * @returns Processed domain modeling result
   */
  public async process(validInput: DomainModelingData): Promise<any> {
    // Handle session management if available
    let sessionData: DomainModelingSessionData | null = null;
    const modelingId = validInput.modelingId;

    if (this.sessionManager && modelingId) {
      try {
        // Try to get existing session
        sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
        
        if (!sessionData) {
          // Create new session
          await this.sessionManager.createSession(modelingId, 'domain_modeling');
          sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
        }
        
        if (sessionData) {
          // Update session with current data
          sessionData.modelData = validInput;
          
          // Add to iteration history if this is a new iteration
          const existingIteration = sessionData.iterationHistory.find(
            i => i.iteration === validInput.iteration && i.stage === validInput.stage
          );
          if (!existingIteration) {
            sessionData.iterationHistory.push({
              iteration: validInput.iteration,
              stage: validInput.stage,
              timestamp: new Date(),
              entities: validInput.entities.length,
              relationships: validInput.relationships?.length || 0,
              domainRules: validInput.domainRules?.length || 0,
              abstractionLevel: validInput.abstractionLevel,
              paradigm: validInput.paradigm,
              changes: this.detectChanges(sessionData.modelData, validInput)
            });
          }
          
          // Add validation results if present
          if (validInput.modelValidation) {
            sessionData.validationResults.push({
              iteration: validInput.iteration,
              timestamp: new Date(),
              validation: validInput.modelValidation,
              stage: validInput.stage
            });
          }
          
          // Save updated session
          await this.sessionManager.updateDomainModelingSession(modelingId, sessionData);
        }
      } catch (error) {
        console.warn('Session management error:', error);
      }
    }
    // Format output using boxed utility
    const formattedOutput = this.formatDomainModelingOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }
    try {
      // Calculate basic counts
      const entityCount = validInput.entities.length;
      const relationshipCount = validInput.relationships?.length || 0;
      const domainRuleCount = validInput.domainRules?.length || 0;

      // Calculate model complexity
      const complexityScore = entityCount + (relationshipCount * 1.5) + (domainRuleCount * 2);
      let modelComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
      if (complexityScore < 10) {
        modelComplexity = 'LOW';
      } else if (complexityScore <= 20) {
        modelComplexity = 'MEDIUM';
      } else {
        modelComplexity = 'HIGH';
      }

      // Calculate model health
      let modelHealth = 0;
      
      // Base score for having entities (higher base score)
      modelHealth += entityCount * 2;
      
      // Bonus for entities with good attribute count (>3)
      const wellDefinedEntities = validInput.entities.filter((entity: any) => entity.attributes.length > 3).length;
      modelHealth += wellDefinedEntities * 1.5;
      
      // Bonus for relationships
      modelHealth += relationshipCount * 1.5;
      
      // Bonus for domain rules
      modelHealth += domainRuleCount * 2;
      
      // Bonus for boundaries
      if (validInput.boundaries) {
        modelHealth += 2;
      }
      
      // Bonus for validation scores
      if (validInput.modelValidation) {
        const avgValidationScore = (
          validInput.modelValidation.completeness + 
          validInput.modelValidation.consistency + 
          validInput.modelValidation.correctness
        ) / 3;
        modelHealth += avgValidationScore * 5; // Higher validation bonus
      }

      // Check for optional features
      const hasBoundaries = !!validInput.boundaries;
      const hasModelValidation = !!validInput.modelValidation;
      const hasAssumptions = !!(validInput.assumptions && validInput.assumptions.length > 0);
      const hasStakeholders = !!(validInput.stakeholders && validInput.stakeholders.length > 0);
      const hasUseCases = !!(validInput.useCases && validInput.useCases.length > 0);
      const hasModelingNotes = !!(validInput.modelingNotes && validInput.modelingNotes.length > 0);

      const result = {
        status: 'success',
        domainName: validInput.domainName,
        description: validInput.description,
        modelingId: validInput.modelingId,
        iteration: validInput.iteration,
        stage: validInput.stage,
        entityCount,
        relationshipCount,
        domainRuleCount,
        modelComplexity,
        modelHealth,
        hasBoundaries,
        hasModelValidation,
        hasAssumptions,
        hasStakeholders,
        hasUseCases,
        hasModelingNotes,
        abstractionLevel: validInput.abstractionLevel,
        paradigm: validInput.paradigm,
        nextStageNeeded: validInput.nextStageNeeded,
        suggestedNextStage: validInput.suggestedNextStage,
        timestamp: new Date().toISOString(),
        sessionPersisted: !!sessionData, // Indicate if session was persisted
      };

      // Include session context if available
      if (sessionData) {
        (result as any).sessionContext = {
          totalIterations: sessionData.iterationHistory.length,
          stagesCompleted: [...new Set(sessionData.iterationHistory.map(i => i.stage))],
          validationCount: sessionData.validationResults.length,
          sessionCreated: sessionData.createdAt,
          lastAccessed: sessionData.lastAccessedAt,
          modelEvolution: {
            firstIteration: sessionData.iterationHistory[0]?.iteration || validInput.iteration,
            currentIteration: validInput.iteration,
            iterationCount: sessionData.iterationHistory.length,
            paradigmHistory: [...new Set(sessionData.iterationHistory.map(i => i.paradigm))],
            complexityProgression: sessionData.iterationHistory.map(i => ({
              iteration: i.iteration,
              stage: i.stage,
              entities: i.entities,
              relationships: i.relationships,
              domainRules: i.domainRules
            }))
          }
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  private formatDomainModelingOutput(data: DomainModelingData): string {
    const sections: Record<string, string | string[]> = {
      'Domain': `${data.domainName} (${data.paradigm})`,
      'Stage': `${data.stage} (Iteration ${data.iteration})`,
      'Description': data.description,
    };

    // Entities
    if (data.entities && data.entities.length > 0) {
      sections['Entities'] = data.entities.map(entity => {
        const attributes = entity.attributes.join(', ');
        return `• ${entity.name}: [${attributes}]`;
      });
    }

    // Relationships
    if (data.relationships && data.relationships.length > 0) {
      sections['Relationships'] = data.relationships.map(rel => {
        return `• ${rel.sourceEntity} --(${rel.name})--> ${rel.targetEntity} (${rel.type})`;
      });
    }

    // Separate Axioms, Rules, and Constraints
    const axioms = data.domainRules?.filter(rule => rule.type === 'axiom') || [];
    const businessRules = data.domainRules?.filter(rule => rule.type === 'business-rule') || [];
    const constraints = data.domainRules?.filter(rule => ['constraint', 'validation-rule', 'invariant'].includes(rule.type)) || [];

    if (axioms.length > 0) {
      sections['Axioms (Core Truths)'] = axioms.map(rule => `• ${rule.name}: ${rule.description}`);
    }
    
    if (businessRules.length > 0) {
      sections['Business Rules'] = businessRules.map(rule => `• ${rule.name}: IF ${rule.condition} THEN ${rule.consequence}`);
    }

    if (constraints.length > 0) {
      sections['Constraints & Invariants'] = constraints.map(rule => `• ${rule.name}: ${rule.description}`);
    }

    if (data.boundaries) {
      sections['Boundaries'] = `Context: ${data.boundaries.name}. Includes: ${data.boundaries.includedEntities.join(', ')}.`;
    }

    return boxed('🏛️ Domain Modeling', sections);
  }

  /**
   * Detect changes between previous and current model iterations
   */
  private detectChanges(previousModel: any, currentModel: DomainModelingData): any {
    if (!previousModel) {
      return { type: 'initial', description: 'Initial model creation' };
    }

    const changes: any = {
      type: 'iteration',
      entities: {
        added: currentModel.entities.filter(e => !previousModel.entities?.find((p: any) => p.name === e.name)),
        removed: previousModel.entities?.filter((p: any) => !currentModel.entities.find(e => e.name === p.name)) || [],
        modified: []
      },
      relationships: {
        added: (currentModel.relationships || []).filter(r => !previousModel.relationships?.find((p: any) => p.name === r.name)),
        removed: (previousModel.relationships || []).filter((p: any) => !(currentModel.relationships || []).find(r => r.name === p.name))
      },
      domainRules: {
        added: (currentModel.domainRules || []).filter(r => !previousModel.domainRules?.find((p: any) => p.name === r.name)),
        removed: (previousModel.domainRules || []).filter((p: any) => !(currentModel.domainRules || []).find(r => r.name === p.name))
      },
      stageChanged: previousModel.stage !== currentModel.stage,
      paradigmChanged: previousModel.paradigm !== currentModel.paradigm,
      abstractionChanged: previousModel.abstractionLevel !== currentModel.abstractionLevel
    };

    return changes;
  }

  /**
   * Retrieve modeling session history for a given modeling ID
   */
  public async getIterationHistory(modelingId: string): Promise<any[]> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
      return sessionData ? sessionData.iterationHistory : [];
    } catch (error) {
      console.warn('Error retrieving iteration history:', error);
      return [];
    }
  }

  /**
   * Retrieve validation results for a given modeling ID
   */
  public async getValidationHistory(modelingId: string): Promise<any[]> {
    if (!this.sessionManager) {
      return [];
    }

    try {
      const sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
      return sessionData ? sessionData.validationResults : [];
    } catch (error) {
      console.warn('Error retrieving validation history:', error);
      return [];
    }
  }

  /**
   * Retrieve current model data
   */
  public async getModelData(modelingId: string): Promise<DomainModelingData | null> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      const sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
      return sessionData ? sessionData.modelData : null;
    } catch (error) {
      console.warn('Error retrieving model data:', error);
      return null;
    }
  }

  /**
   * Clear a specific modeling session
   */
  public async clearModelingSession(modelingId: string): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      await this.sessionManager.clearSession(modelingId);
      return true;
    } catch (error) {
      console.warn('Error clearing modeling session:', error);
      return false;
    }
  }

  /**
   * Get model evolution summary
   */
  public async getModelEvolution(modelingId: string): Promise<any> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      const sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
      if (sessionData) {
        const iterations = sessionData.iterationHistory;
        const validations = sessionData.validationResults;
        
        return {
          modelingId,
          totalIterations: iterations.length,
          stages: [...new Set(iterations.map(i => i.stage))],
          paradigms: [...new Set(iterations.map(i => i.paradigm))],
          complexityTrend: iterations.map(i => ({
            iteration: i.iteration,
            totalElements: i.entities + i.relationships + i.domainRules
          })),
          validationTrend: validations.map(v => ({
            iteration: v.iteration,
            avgScore: (v.validation.completeness + v.validation.consistency + v.validation.correctness) / 3
          })),
          sessionDuration: sessionData.lastAccessedAt.getTime() - sessionData.createdAt.getTime(),
          isActive: sessionData.modelData?.nextStageNeeded || false
        };
      }
      return null;
    } catch (error) {
      console.warn('Error getting model evolution:', error);
      return null;
    }
  }

  /**
   * Add validation result to existing session
   */
  public async addValidation(modelingId: string, validation: any): Promise<boolean> {
    if (!this.sessionManager) {
      return false;
    }

    try {
      const sessionData = await this.sessionManager.getDomainModelingSession(modelingId);
      if (sessionData) {
        sessionData.validationResults.push({
          timestamp: new Date(),
          validation: validation,
          iteration: sessionData.modelData?.iteration || 1,
          stage: sessionData.modelData?.stage || 'analysis'
        });
        await this.sessionManager.updateDomainModelingSession(modelingId, sessionData);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error adding validation:', error);
      return false;
    }
  }
} 