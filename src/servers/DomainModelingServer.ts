import { BaseToolServer } from '../base/BaseToolServer.js';
import { DomainModelingSchema, DomainModelingData, DomainRuleData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Domain Modeling Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class DomainModelingServer extends BaseToolServer<DomainModelingData, any> {
  constructor() {
    super(DomainModelingSchema);
  }

  protected handle(validInput: DomainModelingData): any {
    // The handle method now simply returns the validated data for the formatter.
    return validInput;
  }

  /**
   * Override run method to use custom formatting
   */
  public run(rawInput: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      // Validate input using schema
      const validatedInput = this.validate(rawInput);

      // Process with concrete implementation
      const result = this.handle(validatedInput);

      // Use custom formatting
      return {
        content: this.formatResponse(result)
      };
    } catch (error) {
      // Format error response
      return {
        content: this.formatError(error instanceof Error ? error : new Error(String(error))),
        isError: true
      };
    }
  }

  /**
   * Process domain modeling input and return analysis results
   */
  public process(input: DomainModelingData): any {
    try {
      // Calculate basic counts
      const entityCount = input.entities.length;
      const relationshipCount = input.relationships?.length || 0;
      const domainRuleCount = input.domainRules?.length || 0;

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
      const wellDefinedEntities = input.entities.filter(entity => entity.attributes.length > 3).length;
      modelHealth += wellDefinedEntities * 1.5;
      
      // Bonus for relationships
      modelHealth += relationshipCount * 1.5;
      
      // Bonus for domain rules
      modelHealth += domainRuleCount * 2;
      
      // Bonus for boundaries
      if (input.boundaries) {
        modelHealth += 2;
      }
      
      // Bonus for validation scores
      if (input.modelValidation) {
        const avgValidationScore = (
          input.modelValidation.completeness + 
          input.modelValidation.consistency + 
          input.modelValidation.correctness
        ) / 3;
        modelHealth += avgValidationScore * 5; // Higher validation bonus
      }

      // Check for optional features
      const hasBoundaries = !!input.boundaries;
      const hasModelValidation = !!input.modelValidation;
      const hasAssumptions = !!(input.assumptions && input.assumptions.length > 0);
      const hasStakeholders = !!(input.stakeholders && input.stakeholders.length > 0);
      const hasUseCases = !!(input.useCases && input.useCases.length > 0);
      const hasModelingNotes = !!(input.modelingNotes && input.modelingNotes.length > 0);

      return {
        status: 'success',
        domainName: input.domainName,
        description: input.description,
        modelingId: input.modelingId,
        iteration: input.iteration,
        stage: input.stage,
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
        abstractionLevel: input.abstractionLevel,
        paradigm: input.paradigm,
        nextStageNeeded: input.nextStageNeeded,
        suggestedNextStage: input.suggestedNextStage,
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

  /**
   * Format the response for display
   */
  protected formatResponse(data: DomainModelingData): Array<{ type: string; text: string }> {
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

    const formattedText = boxed('🏛️ Domain Modeling', sections);
    return [{ type: 'text', text: formattedText }];
  }
} 