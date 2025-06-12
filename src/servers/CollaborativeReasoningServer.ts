import { BaseToolServer } from '../base/BaseToolServer.js';
import { CollaborativeReasoningSchema, CollaborativeReasoningData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Collaborative Reasoning Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class CollaborativeReasoningServer extends BaseToolServer<CollaborativeReasoningData, any> {
  constructor() {
    super(CollaborativeReasoningSchema);
  }

  protected handle(validInput: CollaborativeReasoningData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for collaborative reasoning
   * @param validInput - Validated collaborative reasoning data
   * @returns Processed collaborative reasoning result
   */
  public process(validInput: CollaborativeReasoningData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatCollaborativeOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
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
    };
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
}
