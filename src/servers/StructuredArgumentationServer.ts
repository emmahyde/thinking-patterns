import { BaseToolServer } from '../base/BaseToolServer.js';
import { StructuredArgumentationSchema, StructuredArgumentationData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Structured Argumentation Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class StructuredArgumentationServer extends BaseToolServer<StructuredArgumentationData, any> {
  constructor() {
    super(StructuredArgumentationSchema);
  }

  protected handle(validInput: StructuredArgumentationData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for structured argumentation
   * @param validInput - Validated structured argumentation data
   * @returns Processed structured argumentation result
   */
  public process(validInput: StructuredArgumentationData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatArgumentationOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      claim: validInput.claim,
      premises: validInput.premises,
      conclusion: validInput.conclusion,
      argumentId: validInput.argumentId,
      argumentType: validInput.argumentType,
      confidence: validInput.confidence,
      respondsTo: validInput.respondsTo,
      supports: validInput.supports,
      contradicts: validInput.contradicts,
      strengths: validInput.strengths,
      weaknesses: validInput.weaknesses,
      suggestedNextTypes: validInput.suggestedNextTypes,
      nextArgumentNeeded: validInput.nextArgumentNeeded,
      status: 'success',
      premiseCount: validInput.premises.length,
      hasConclusion: !!validInput.conclusion,
      hasRespondsTo: !!validInput.respondsTo,
      hasSupports: !!validInput.supports && validInput.supports.length > 0,
      hasContradicts: !!validInput.contradicts && validInput.contradicts.length > 0,
      strengthCount: validInput.strengths?.length ?? 0,
      weaknessCount: validInput.weaknesses?.length ?? 0,
      hasSuggestedNextTypes: !!validInput.suggestedNextTypes && validInput.suggestedNextTypes.length > 0,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatArgumentationOutput(data: StructuredArgumentationData): string {
    const sections: Record<string, string | string[]> = {
      'Claim': data.claim,
      'Argument Type': data.argumentType.toUpperCase(),
      'Confidence': `${(data.confidence * 100).toFixed(1)}%`
    };

    if (data.argumentId) {
      sections['Argument ID'] = data.argumentId;
    }

    // Premises
    if (data.premises.length > 0) {
      sections['Premises'] = data.premises.map((premise, index) => `${index + 1}. ${premise}`);
    }

    // Conclusion
    if (data.conclusion) {
      sections['Conclusion'] = data.conclusion;
    }

    // Relationships
    if (data.respondsTo) {
      sections['Responds To'] = data.respondsTo;
    }

    if (data.supports && data.supports.length > 0) {
      sections['Supports'] = data.supports.map(support => `• ${support}`);
    }

    if (data.contradicts && data.contradicts.length > 0) {
      sections['Contradicts'] = data.contradicts.map(contradiction => `• ${contradiction}`);
    }

    // Analysis
    if (data.strengths && data.strengths.length > 0) {
      sections['Strengths'] = data.strengths.map(strength => `• ${strength}`);
    }

    if (data.weaknesses && data.weaknesses.length > 0) {
      sections['Weaknesses'] = data.weaknesses.map(weakness => `• ${weakness}`);
    }

    // Suggested next types
    if (data.suggestedNextTypes && data.suggestedNextTypes.length > 0) {
      sections['Suggested Next Arguments'] = data.suggestedNextTypes.map(type => `• ${type}`);
    }

    return boxed('⚖️ Structured Argumentation', sections);
  }
}
