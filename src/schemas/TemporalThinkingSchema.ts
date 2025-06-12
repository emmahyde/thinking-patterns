import { z } from 'zod';

// Enhanced Temporal Thinking Schema with complex structural information
export const StatePropertiesSchema = z.object({
  isInitial: z.boolean().optional().describe("Whether this is an initial state."),
  isFinal: z.boolean().optional().describe("Whether this is a final/terminal state."),
  isStable: z.boolean().optional().describe("Whether this state is stable or transient."),
  duration: z.object({
    min: z.string().optional().describe("Minimum time spent in this state."),
    max: z.string().optional().describe("Maximum time spent in this state."),
    typical: z.string().optional().describe("Typical time spent in this state.")
  }).optional().describe("Duration constraints for this state."),
  capacity: z.number().optional().describe("Maximum number of entities that can be in this state simultaneously."),
  cost: z.number().optional().describe("Cost associated with being in this state."),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority level of this state.")
});

export const StateSchema = z.object({
  name: z.string().describe("The unique name of the state."),
  description: z.string().optional().describe("A detailed description of what this state represents."),
  properties: StatePropertiesSchema.optional().describe("Additional properties and constraints for this state."),
  invariants: z.array(z.string()).optional().describe("Conditions that must always be true while in this state."),
  entryActions: z.array(z.string()).optional().describe("Actions performed when entering this state."),
  exitActions: z.array(z.string()).optional().describe("Actions performed when leaving this state."),
  subStates: z.array(z.string()).optional().describe("Sub-states if this is a composite state."),
  parentState: z.string().optional().describe("Parent state if this is a sub-state.")
});

export const EventPropertiesSchema = z.object({
  type: z.enum(["internal", "external", "timer", "condition"]).optional().describe("The type of event."),
  frequency: z.string().optional().describe("How often this event typically occurs."),
  predictability: z.enum(["deterministic", "stochastic", "unpredictable"]).optional().describe("Predictability of the event."),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority level of this event."),
  cost: z.number().optional().describe("Cost associated with this event occurring.")
});

export const EventSchema = z.object({
  name: z.string().describe("The unique name of the event that triggers a transition."),
  description: z.string().optional().describe("A detailed description of what causes this event."),
  properties: EventPropertiesSchema.optional().describe("Additional properties of the event."),
  preconditions: z.array(z.string()).optional().describe("Conditions that must be met for this event to occur."),
  parameters: z.array(z.object({
    name: z.string().describe("Name of the parameter."),
    type: z.string().describe("Type of the parameter."),
    description: z.string().optional().describe("Description of the parameter.")
  })).optional().describe("Parameters associated with this event."),
  triggers: z.array(z.string()).optional().describe("What can trigger this event.")
});

export const TransitionPropertiesSchema = z.object({
  probability: z.number().min(0).max(1).optional().describe("Probability of this transition occurring when the event happens."),
  duration: z.string().optional().describe("Time taken for this transition to complete."),
  cost: z.number().optional().describe("Cost associated with this transition."),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority of this transition."),
  reversible: z.boolean().optional().describe("Whether this transition can be reversed.")
});

export const TransitionSchema = z.object({
  from: z.string().describe("The name of the state from which the transition originates."),
  to: z.string().describe("The name of the state to which the transition leads."),
  event: z.string().describe("The name of the event that triggers this transition."),
  guard: z.string().optional().describe("A condition that must be true for the transition to occur."),
  action: z.string().optional().describe("An action that is performed when this transition occurs."),
  properties: TransitionPropertiesSchema.optional().describe("Additional properties of the transition."),
  sideEffects: z.array(z.string()).optional().describe("Side effects that occur during this transition."),
  rollbackActions: z.array(z.string()).optional().describe("Actions to perform if the transition needs to be rolled back.")
});

export const TemporalAnalysisSchema = z.object({
  reachability: z.object({
    reachableStates: z.array(z.string()).describe("States that can be reached from the initial state."),
    unreachableStates: z.array(z.string()).optional().describe("States that cannot be reached."),
    deadlockStates: z.array(z.string()).optional().describe("States from which no further transitions are possible.")
  }).optional().describe("Reachability analysis of the state machine."),
  cycles: z.array(z.object({
    states: z.array(z.string()).describe("States involved in the cycle."),
    type: z.enum(["simple", "complex", "self-loop"]).describe("Type of cycle."),
    length: z.number().describe("Number of transitions in the cycle.")
  })).optional().describe("Cycles detected in the state machine."),
  criticalPaths: z.array(z.object({
    path: z.array(z.string()).describe("Sequence of states in the critical path."),
    duration: z.string().optional().describe("Total duration of this path."),
    probability: z.number().min(0).max(1).optional().describe("Probability of following this path.")
  })).optional().describe("Critical paths through the state machine."),
  bottlenecks: z.array(z.object({
    state: z.string().describe("State that acts as a bottleneck."),
    reason: z.string().describe("Why this state is a bottleneck."),
    impact: z.enum(["low", "medium", "high"]).describe("Impact level of the bottleneck.")
  })).optional().describe("Bottlenecks identified in the system.")
});

export const ValidationResultsSchema = z.object({
  isValid: z.boolean().describe("Whether the temporal model is valid."),
  completeness: z.number().min(0).max(1).describe("Completeness score of the model."),
  consistency: z.number().min(0).max(1).describe("Consistency score of the model."),
  issues: z.array(z.object({
    type: z.enum(["error", "warning", "suggestion"]).describe("Type of issue."),
    description: z.string().describe("Description of the issue."),
    location: z.string().optional().describe("Where the issue occurs."),
    severity: z.enum(["low", "medium", "high", "critical"]).describe("Severity of the issue.")
  })).optional().describe("Issues found during validation."),
  suggestions: z.array(z.string()).optional().describe("Suggestions for improving the model.")
});

export const TemporalThinkingSchema = z.object({
  context: z.string().describe("A comprehensive description of the system or process being modeled."),
  modelId: z.string().optional().describe("A unique identifier for this temporal model."),
  domain: z.string().optional().describe("The domain this model belongs to (e.g., 'business process', 'software system')."),
  purpose: z.string().optional().describe("The purpose or goal of creating this temporal model."),
  
  // Core temporal structure
  initialState: z.string().describe("The name of the initial state of the system."),
  states: z.array(StateSchema).describe("A comprehensive list of all possible states in the system."),
  events: z.array(EventSchema).describe("A comprehensive list of all possible events that can occur."),
  transitions: z.array(TransitionSchema).describe("A comprehensive list of all possible transitions between states."),
  finalStates: z.array(z.string()).optional().describe("A list of states that are considered terminal or final."),
  
  // Analysis and validation
  analysis: TemporalAnalysisSchema.optional().describe("Analysis results of the temporal model."),
  validation: ValidationResultsSchema.optional().describe("Validation results of the temporal model."),
  
  // Constraints and properties
  globalConstraints: z.array(z.string()).optional().describe("Global constraints that apply to the entire system."),
  timeConstraints: z.array(z.object({
    description: z.string().describe("Description of the time constraint."),
    type: z.enum(["deadline", "duration", "interval", "frequency"]).describe("Type of time constraint."),
    value: z.string().describe("Value of the constraint (e.g., '5 minutes', 'daily').")
  })).optional().describe("Time-based constraints on the system."),
  
  // Simulation and testing
  scenarios: z.array(z.object({
    name: z.string().describe("Name of the scenario."),
    description: z.string().describe("Description of the scenario."),
    initialConditions: z.array(z.string()).describe("Initial conditions for this scenario."),
    expectedOutcome: z.string().optional().describe("Expected outcome of this scenario."),
    testSteps: z.array(z.string()).optional().describe("Steps to test this scenario.")
  })).optional().describe("Test scenarios for the temporal model."),
  
  // Meta information
  complexity: z.enum(["low", "medium", "high", "very-high"]).optional().describe("Complexity level of the temporal model."),
  completeness: z.number().min(0).max(1).optional().describe("Completeness score of the model."),
  lastModified: z.string().optional().describe("When this model was last modified."),
  version: z.string().optional().describe("Version of this temporal model."),
  tags: z.array(z.string()).optional().describe("Tags for categorizing this model.")
});

// Type exports for TypeScript
export type State = z.infer<typeof StateSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type TemporalThinking = z.infer<typeof TemporalThinkingSchema>;
export type StateProperties = z.infer<typeof StatePropertiesSchema>;
export type EventProperties = z.infer<typeof EventPropertiesSchema>;
export type TransitionProperties = z.infer<typeof TransitionPropertiesSchema>;
export type TemporalAnalysis = z.infer<typeof TemporalAnalysisSchema>;
export type ValidationResults = z.infer<typeof ValidationResultsSchema>; 