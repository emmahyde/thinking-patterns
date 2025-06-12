import { z } from 'zod';

export const StateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const EventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const TransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  event: z.string(),
  guard: z.string().optional(), // A condition that must be true
  action: z.string().optional(), // An action performed during transition
});

export const TemporalThinkingSchema = z.object({
  context: z.string(), // e.g., "Order management flow"
  initialState: z.string(),
  states: z.array(StateSchema),
  events: z.array(EventSchema),
  transitions: z.array(TransitionSchema),
  finalStates: z.array(z.string()).optional(),
});

export type State = z.infer<typeof StateSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type TemporalThinking = z.infer<typeof TemporalThinkingSchema>; 