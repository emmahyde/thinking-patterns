import { BaseToolServer } from '../base/BaseToolServer.js';
import { ProblemDecompositionSchema, ProblemDecompositionData, Task } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Problem Decomposition Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class ProblemDecompositionServer extends BaseToolServer<ProblemDecompositionData, any> {
  constructor() {
    super(ProblemDecompositionSchema);
  }

  protected handle(validInput: ProblemDecompositionData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for problem decomposition
   * @param validInput - Validated problem decomposition data
   * @returns Processed problem decomposition result
   */
  public process(validInput: ProblemDecompositionData): any {
    const formattedOutput = this.formatOutput(validInput);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const taskCount = (function countTasks(tasks: Task[]): number {
      return tasks.reduce((acc, task) => {
        return acc + 1 + (task.subTasks ? countTasks(task.subTasks) : 0);
      }, 0);
    })(validInput.decomposition);

    return {
      ...validInput,
      taskCount,
      status: 'success',
      timestamp: new Date().toISOString(),
      hasMetrics: !!validInput.metrics,
      objectiveCount: validInput.objectives?.length ?? 0,
    };
  }

  private formatOutput(data: ProblemDecompositionData): string {
    const sections: Record<string, string | string[]> = {
      'Problem': data.problem,
    };

    if (data.decompositionId) sections['Decomposition ID'] = data.decompositionId;
    if (data.methodology) sections['Methodology'] = data.methodology;

    const formatTasks = (tasks: Task[], indent = 0): string[] => {
      let result: string[] = [];
      for (const task of tasks) {
        const prefix = '  '.repeat(indent) + '• ';
        const details = [];
        if (task.priority) details.push(`P: ${task.priority}`);
        if (task.progress?.status) details.push(task.progress.status);
        if (task.effortEstimate) details.push(`E: ${task.effortEstimate}`);
        const detailsString = details.length > 0 ? ` (${details.join(', ')})` : '';
        
        result.push(`${prefix}${task.description}${detailsString}`);
        
        if (task.subTasks) {
          result = result.concat(formatTasks(task.subTasks, indent + 1));
        }
      }
      return result;
    }

    if (data.decomposition && data.decomposition.length > 0) {
      sections['Decomposition'] = formatTasks(data.decomposition);
    }

    if (data.metrics) {
      const metrics = [];
      metrics.push(`Total Tasks: ${data.metrics.totalTasks}`);
      metrics.push(`Max Depth: ${data.metrics.maxDepth}`);
      if (data.metrics.estimatedTotalEffort) metrics.push(`Total Effort: ${data.metrics.estimatedTotalEffort}`);
      if (data.metrics.riskScore) metrics.push(`Risk Score: ${(data.metrics.riskScore * 100).toFixed(0)}%`);
      sections['Metrics'] = metrics.map(m => `• ${m}`);
    }

    return boxed('🧩 Problem Decomposition', sections);
  }
} 