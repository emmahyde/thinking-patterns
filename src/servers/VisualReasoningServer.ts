import { BaseToolServer } from '../base/BaseToolServer.js';
import { VisualReasoningSchema, VisualReasoningData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Visual Reasoning Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class VisualReasoningServer extends BaseToolServer<VisualReasoningData, any> {
  constructor() {
    super(VisualReasoningSchema);
  }

  protected handle(validInput: VisualReasoningData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for visual reasoning
   * @param validInput - Validated visual reasoning data
   * @returns Processed visual reasoning result
   */
  public process(validInput: VisualReasoningData): any {
    // Format output using boxed utility
    const formattedOutput = this.formatVisualOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
      diagramId: validInput.diagramId,
      diagramType: validInput.diagramType,
      operation: validInput.operation,
      iteration: validInput.iteration,
      nextOperationNeeded: validInput.nextOperationNeeded,
      status: 'success',
      elementCount: validInput.elements?.length ?? 0,
      hasObservation: !!validInput.observation,
      hasInsight: !!validInput.insight,
      hasHypothesis: !!validInput.hypothesis,
      transformationType: validInput.transformationType,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private formatVisualOutput(data: VisualReasoningData): string {
    const sections: Record<string, string | string[]> = {
      'Diagram ID': data.diagramId,
      'Diagram Type': data.diagramType.replace(/([A-Z])/g, ' $1').trim().toUpperCase(),
      'Operation': data.operation.toUpperCase(),
      'Iteration': data.iteration.toString()
    };

    // Transformation type
    if (data.transformationType) {
      sections['Transformation'] = data.transformationType.toUpperCase();
    }

    // Elements
    if (data.elements && data.elements.length > 0) {
      sections['Elements'] = data.elements.map(element => {
        let elementDesc = `• ${element.type.toUpperCase()}: ${element.id}`;
        if (element.label) {
          elementDesc += ` (${element.label})`;
        }
        if (element.type === 'edge' && element.source && element.target) {
          elementDesc += ` [${element.source} → ${element.target}]`;
        }
        if (element.contains && element.contains.length > 0) {
          elementDesc += ` contains: ${element.contains.join(', ')}`;
        }
        return elementDesc;
      });
    }

    // Observation
    if (data.observation) {
      sections['Observation'] = data.observation;
    }

    // Insight
    if (data.insight) {
      sections['Insight'] = data.insight;
    }

    // Hypothesis
    if (data.hypothesis) {
      sections['Hypothesis'] = data.hypothesis;
    }

    // Visual reasoning suggestions
    const suggestions = this.generateVisualSuggestions(data);
    if (suggestions.length > 0) {
      sections['Visual Analysis Suggestions'] = suggestions;
    }

    return boxed('👁️ Visual Reasoning', sections);
  }

  private generateVisualSuggestions(data: VisualReasoningData): string[] {
    const suggestions: string[] = [];

    switch (data.diagramType) {
      case 'graph':
        suggestions.push('• Analyze node centrality and clustering patterns');
        suggestions.push('• Look for shortest paths and critical connections');
        suggestions.push('• Consider network topology and flow patterns');
        break;
      case 'flowchart':
        suggestions.push('• Trace decision paths and identify bottlenecks');
        suggestions.push('• Verify logical flow and completeness');
        suggestions.push('• Check for parallel processes and dependencies');
        break;
      case 'stateDiagram':
        suggestions.push('• Validate state transitions and completeness');
        suggestions.push('• Identify unreachable or dead-end states');
        suggestions.push('• Analyze state complexity and interaction patterns');
        break;
      case 'conceptMap':
        suggestions.push('• Examine concept hierarchies and relationships');
        suggestions.push('• Look for missing connections or concepts');
        suggestions.push('• Assess conceptual coherence and organization');
        break;
      case 'treeDiagram':
        suggestions.push('• Analyze branching patterns and depth');
        suggestions.push('• Check for balanced structure and completeness');
        suggestions.push('• Identify leaf nodes and decision points');
        break;
      default:
        suggestions.push('• Examine spatial relationships and patterns');
        suggestions.push('• Look for symmetries and structural properties');
        suggestions.push('• Consider visual hierarchy and information flow');
    }

    return suggestions;
  }
}
