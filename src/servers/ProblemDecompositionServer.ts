import { BaseToolServer } from '../base/BaseToolServer.js';
import { ProblemDecompositionSchema, ProblemDecomposition, Task } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

export class ProblemDecompositionServer extends BaseToolServer<ProblemDecomposition, any> {
  constructor() {
    super(ProblemDecompositionSchema);
  }

  protected handle(validInput: ProblemDecomposition): any {
    return this.process(validInput);
  }

  public process(validInput: ProblemDecomposition): any {
    const formattedOutput = this.formatOutput(validInput);

    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    const taskCount = (function countTasks(tasks: Task[]): number {
      return tasks.reduce((acc, task) => {
        return acc + 1 + (task.subTasks ? countTasks(task.subTasks) : 0);
      }, 0);
    })(validInput.decomposition);

    return {
      problem: validInput.problem,
      taskCount,
      decomposition: validInput.decomposition,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  private formatOutput(data: ProblemDecomposition): string {
    const sections: Record<string, string | string[]> = {
      'Problem': data.problem,
    };

    const formatTasks = (tasks: Task[], indent = 0): string[] => {
      let result: string[] = [];
      for (const task of tasks) {
        const prefix = '  '.repeat(indent) + '• ';
        result.push(`${prefix}${task.description}`);
        if (task.subTasks) {
          result = result.concat(formatTasks(task.subTasks, indent + 1));
        }
      }
      return result;
    }

    if (data.decomposition && data.decomposition.length > 0) {
      sections['Decomposition'] = formatTasks(data.decomposition);
    }

    return boxed('🧩 Problem Decomposition', sections);
  }
} 