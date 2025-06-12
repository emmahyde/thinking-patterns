import { BaseToolServer } from '../base/BaseToolServer.js';
import { DomainModelingSchema, DomainModelingData, DomainRuleData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Domain Modeling Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class DomainModelingServer extends BaseToolServer<DomainModelingData, any> {
  constructor() {
    super(DomainModelingSchema);
  }

  protected handle(validInput: DomainModelingData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for domain modeling
   * @param validInput - Validated domain modeling data
   * @returns Processed domain modeling result
   */
  public process(validInput: DomainModelingData): any {
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

      return {
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
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
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
} 