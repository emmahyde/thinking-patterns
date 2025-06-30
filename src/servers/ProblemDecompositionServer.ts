import { BaseToolServer } from '../base/BaseToolServer.js';
import { ProblemDecompositionSchema, ProblemDecompositionData, Task } from '../schemas/index.js';
import { boxed } from '../utils/index.js';
import { SessionManager, ProblemDecompositionSessionData } from '../services/SessionManager.js';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Problem Decomposition Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 * Includes Redis session management for persistent decomposition sessions
 */
export class ProblemDecompositionServer extends BaseToolServer<ProblemDecompositionData, any> {
  public sessionManager: SessionManager | null = null;

  constructor() {
    super(ProblemDecompositionSchema);
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

  protected async handle(validInput: ProblemDecompositionData): Promise<any> {
    return await this.process(validInput);
  }

  /**
   * Standardized process method for problem decomposition with Redis session persistence
   * @param validInput - Validated problem decomposition data
   * @returns Processed problem decomposition result
   */
  public async process(validInput: ProblemDecompositionData): Promise<any> {
    // Handle session management if available
    let sessionData: ProblemDecompositionSessionData | null = null;
    const decompositionId = validInput.decompositionId;

    if (this.sessionManager && decompositionId) {
      try {
        // Try to get existing session
        sessionData = await this.sessionManager.getProblemDecompositionSession(decompositionId);

        if (!sessionData) {
          // Create new session
          await this.sessionManager.createSession(decompositionId, 'problem_decomposition');
          sessionData = await this.sessionManager.getProblemDecompositionSession(decompositionId);
        }

        if (sessionData) {
          // Store previous data before updating
          const previousData = sessionData.decompositionData;

          // Track progress updates for individual tasks BEFORE updating session data
          if (validInput.decomposition && previousData && previousData.decomposition) {
            this.trackProgressChanges(sessionData, validInput.decomposition);
          }

          // Update session with current data
          sessionData.decompositionData = validInput;

          // Add to revision history if this is a meaningful change
          if (previousData && Object.keys(previousData).length > 0) {
            const changes = this.detectDecompositionChanges(previousData, validInput);
            const revision = sessionData.revisionHistory.length + 1;

            sessionData.revisionHistory.push({
              revision,
              timestamp: new Date(),
              data: validInput,
              changes
            });
          }

          // Add metrics to history
          if (validInput.metrics) {
            sessionData.metricsHistory.push({
              timestamp: new Date(),
              metrics: validInput.metrics
            });
          }

          // Save updated session
          await this.sessionManager.updateProblemDecompositionSession(decompositionId, sessionData);
        }
      } catch (error) {
        console.warn('Session management error:', error);
      }
    }
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

  /**
   * Detect changes between decomposition data for revision tracking
   */
  private detectDecompositionChanges(previous: ProblemDecompositionData, current: ProblemDecompositionData): any {
    const changes: any = {};

    if (previous.problem !== current.problem) {
      changes.problem = { from: previous.problem, to: current.problem };
    }

    if (previous.methodology !== current.methodology) {
      changes.methodology = { from: previous.methodology, to: current.methodology };
    }

    if (previous.decomposition.length !== current.decomposition.length) {
      changes.taskCount = { from: previous.decomposition.length, to: current.decomposition.length };
    }

    return changes;
  }

  /**
   * Track progress changes in individual tasks
   */
  private trackProgressChanges(sessionData: ProblemDecompositionSessionData, tasks: Task[]): void {
    const flattenTasks = (taskList: Task[]): Task[] => {
      let flat: Task[] = [];
      for (const task of taskList) {
        flat.push(task);
        if (task.subTasks) {
          flat = flat.concat(flattenTasks(task.subTasks));
        }
      }
      return flat;
    };

    const currentTasks = flattenTasks(tasks);
    const previousTasks = sessionData.decompositionData.decomposition ?
      flattenTasks(sessionData.decompositionData.decomposition) : [];

    for (const currentTask of currentTasks) {
      const previousTask = previousTasks.find(t => t.id === currentTask.id);

      if (previousTask && previousTask.progress?.status !== currentTask.progress?.status) {
        sessionData.progressUpdates.push({
          timestamp: new Date(),
          taskId: currentTask.id,
          oldStatus: previousTask.progress?.status || 'not-started',
          newStatus: currentTask.progress?.status || 'not-started',
          notes: `Status changed for task: ${currentTask.description}`
        });
      }
    }
  }

  /**
   * Get session history for this decomposition
   */
  public async getSessionHistory(sessionId: string): Promise<any[]> {
    if (!this.sessionManager) return [];

    try {
      const sessionData = await this.sessionManager.getProblemDecompositionSession(sessionId);
      return sessionData?.revisionHistory || [];
    } catch (error) {
      console.warn('Error getting session history:', error);
      return [];
    }
  }

  /**
   * Clear session data
   */
  public async clearSession(sessionId: string): Promise<boolean> {
    if (!this.sessionManager) return false;

    try {
      await this.sessionManager.clearSession(sessionId);
      return true;
    } catch (error) {
      console.warn('Error clearing session:', error);
      return false;
    }
  }

  /**
   * Get session data
   */
  public async getSessionData(sessionId: string): Promise<any> {
    if (!this.sessionManager) return null;

    try {
      return await this.sessionManager.getProblemDecompositionSession(sessionId);
    } catch (error) {
      console.warn('Error getting session data:', error);
      return null;
    }
  }
}
