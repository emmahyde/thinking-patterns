import { BaseToolServer } from '../base/BaseToolServer.js';
import { MentalModelSchema, MentalModelData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Mental Model Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class MentalModelServer extends BaseToolServer<MentalModelData, any> {
  constructor() {
    super(MentalModelSchema);
  }

  protected handle(validInput: MentalModelData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for mental model
   * @param validInput - Validated mental model data
   * @returns Processed mental model result
   */
  public process(validInput: MentalModelData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatMentalModelOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const analysis = this.analyze(validInput);

    return {
      modelName: validInput.modelName,
      problem: validInput.problem,
      steps: validInput.steps,
      reasoning: validInput.reasoning,
      conclusion: validInput.conclusion,
      analysis: {
        status: 'success',
        timestamp: new Date().toISOString(),
        quality: analysis.quality,
        complexity: analysis.complexity,
        keywords: analysis.keywords,
        suggestions: analysis.suggestions,
      },
      summary: {
        hasSteps: (validInput.steps?.length ?? 0) > 0,
        hasReasoning: !!validInput.reasoning,
        hasConclusion: !!validInput.conclusion,
        stepCount: validInput.steps?.length ?? 0,
      }
    };
  }

  // Backward compatibility method for tests
  public processModel(input: unknown): { content: Array<{ type: string; text: string }>; data?: any; isError?: boolean } {
    try {
      const validatedInput = this.validate(input);
      const result = this.handle(validatedInput);
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

  private analyze(modelData: MentalModelData): { quality: any; complexity: string; keywords: string[]; suggestions: string[] } {
    const quality = {
      completenessScore: 0,
      clarityScore: 0,
      coherenceScore: 0,
      overallRating: 'N/A'
    };
    
    let totalScore = 0;
    let criteriaCount = 0;

    if (modelData.problem.length > 20) {
      totalScore += 1;
    }
    criteriaCount++;

    if (modelData.steps && modelData.steps.length > 0) {
      quality.completenessScore += 0.4;
      if (modelData.steps.every(s => s.length > 10)) {
        quality.clarityScore += 0.4;
      }
    }
    
    if (modelData.reasoning && modelData.reasoning.length > 30) {
      quality.completenessScore += 0.3;
      quality.coherenceScore += 0.4;
    }
    
    if (modelData.conclusion && modelData.conclusion.length > 20) {
      quality.completenessScore += 0.3;
      quality.coherenceScore += 0.6;
    }

    const stepComplexity = modelData.steps ? modelData.steps.length : 0;
    const textComplexity = (modelData.problem.length + (modelData.reasoning?.length ?? 0) + (modelData.conclusion?.length ?? 0)) / 100;
    const totalComplexity = stepComplexity + textComplexity;
    
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (totalComplexity > 10) {
      complexity = 'high';
    } else if (totalComplexity > 5) {
      complexity = 'medium';
    }

    const textCorpus = [modelData.problem, modelData.reasoning, modelData.conclusion, ...(modelData.steps || [])].join(' ');
    const keywords = [...new Set(textCorpus.toLowerCase().match(/\b\w{5,15}\b/g) || [])].slice(0, 10);

    const suggestions = [];
    if (quality.completenessScore < 0.7) {
      suggestions.push("Consider adding more detail to the reasoning or conclusion for a more complete analysis.");
    }
    if (!modelData.steps || modelData.steps.length < 3) {
      suggestions.push("Breaking the problem down into more steps could provide deeper insight.");
    }
    if (quality.coherenceScore < 0.5) {
      suggestions.push("Ensure the conclusion logically follows from the reasoning and steps.");
    }

    return {
      quality,
      complexity,
      keywords,
      suggestions
    };
  }

  private formatMentalModelOutput(modelData: MentalModelData): string {
    const sections: Record<string, string | string[]> = {
      'Model': modelData.modelName,
      'Problem': modelData.problem
    };

    if (modelData.steps && modelData.steps.length > 0) {
      sections['Steps'] = modelData.steps.map(step => `• ${step}`);
    }

    if (modelData.reasoning) {
      sections['Reasoning'] = modelData.reasoning;
    }

    if (modelData.conclusion) {
      sections['Conclusion'] = modelData.conclusion;
    }

    return boxed('🧠 Mental Model', sections);
  }
}
