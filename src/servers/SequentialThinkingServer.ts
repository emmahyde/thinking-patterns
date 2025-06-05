import { BaseToolServer } from '../base/BaseToolServer.js';
import { SequentialThoughtSchema, SequentialThought } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Sequential Thinking Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class SequentialThinkingServer extends BaseToolServer<SequentialThought, any> {
  constructor() {
    super(SequentialThoughtSchema);
  }

  protected handle(validInput: SequentialThought): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for sequential thinking
   * @param validInput - Validated thought data
   * @returns Processed thought result
   */
  public process(validInput: SequentialThought): any {
    // Format output using boxed utility
    const formattedOutput = this.formatThoughtOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return {
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
      framework: 'clear-thought-tools'
    };
  }

  // Backward compatibility method for existing tests
  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    return this.run(input);
  }

  private formatThoughtOutput(data: SequentialThought): string {
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
