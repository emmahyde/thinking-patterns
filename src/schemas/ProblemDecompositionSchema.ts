import { z } from 'zod';

export type Task = {
  id: string;
  description: string;
  subTasks?: Task[];
  dependencies?: string[];
  effortEstimate?: string;
  implementationOrder?: number;
};

export const TaskSchema: z.ZodType<Task> = z.object({
  id: z.string(),
  description: z.string(),
  subTasks: z.array(z.lazy(() => TaskSchema)).optional(),
  dependencies: z.array(z.string()).optional(),
  effortEstimate: z.string().optional(),
  implementationOrder: z.number().optional(),
});

export const ProblemDecompositionSchema = z.object({
  problem: z.string(),
  decomposition: z.array(TaskSchema),
});

export type ProblemDecomposition = z.infer<typeof ProblemDecompositionSchema>; 