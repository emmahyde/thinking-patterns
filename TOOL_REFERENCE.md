# Tool Reference Guide

Complete reference for all 15 thinking pattern tools, including input parameters, output formats, and usage guidelines.

## Quick Reference

| Tool | Category | Purpose | Complexity |
|------|----------|---------|------------|
| [sequential_thinking](#sequential_thinking) | Systematic | Multi-step reasoning with revision | Medium |
| [problem_decomposition](#problem_decomposition) | Systematic | Break complex problems into parts | Low |
| [recursive_thinking](#recursive_thinking) | Systematic | Self-similar problem solving | High |
| [mental_model](#mental_model) | Frameworks | Apply proven thinking patterns | Medium |
| [decision_framework](#decision_framework) | Frameworks | Multi-criteria decision analysis | Medium |
| [domain_modeling](#domain_modeling) | Frameworks | Conceptual problem domain models | High |
| [scientific_method](#scientific_method) | Analysis | Hypothesis testing and experimentation | Medium |
| [critical_thinking](#critical_thinking) | Analysis | Systematic argument evaluation | Medium |
| [debugging_approach](#debugging_approach) | Analysis | Systematic troubleshooting | Low |
| [collaborative_reasoning](#collaborative_reasoning) | Collaborative | Multi-perspective problem solving | High |
| [structured_argumentation](#structured_argumentation) | Collaborative | Dialectical reasoning | Medium |
| [metacognitive_monitoring](#metacognitive_monitoring) | Advanced | Self-assessment of reasoning | Medium |
| [visual_reasoning](#visual_reasoning) | Advanced | Diagram-based thinking | High |
| [temporal_thinking](#temporal_thinking) | Advanced | Time-based system analysis | High |
| [stochastic_algorithm](#stochastic_algorithm) | Probabilistic | Decision-making under uncertainty | High |

## Tool Specifications

### sequential_thinking

**Purpose**: Dynamic multi-step reasoning with revision and branching support.

**Input Parameters**:
```typescript
{
  thought: string;                    // Current thought content (required)
  thoughtNumber: number;              // Current step number (required)
  totalThoughts?: number;             // Total planned steps (optional)
  nextThoughtNeeded?: boolean;        // Whether to continue (optional)
  branchFromThought?: number;         // Create branch from step (optional)
  branchReason?: string;              // Reason for branching (optional)
  currentStep?: {
    stepDescription: string;          // What this step accomplishes
    recommendedTools?: Array<{
      toolName: string;
      confidence: number;
      rationale: string;
      priority: number;
    }>;
    expectedOutcome: string;
    nextStepConditions?: string[];
  };
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     💭 Sequential Thinking       │
├─────────────────────────────────┤
│ Step: 1/5                       │
│ Content: [thought content]      │
│ Status: NEXT THOUGHT NEEDED     │
│ Next: [recommended next step]   │
└─────────────────────────────────┘
```

**Usage Notes**:
- Maintains state across calls within a session
- Supports branching for exploring alternatives
- Can recommend other tools for complex analysis
- Ideal for planning, step-by-step problem solving

**Example**:
```json
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Design a RESTful API for a blog platform",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "currentStep": {
      "stepDescription": "Define core resources and endpoints",
      "expectedOutcome": "Clear API structure with main endpoints identified"
    }
  }
}
```

---

### problem_decomposition

**Purpose**: Break complex problems into manageable sub-problems with clear dependencies.

**Input Parameters**:
```typescript
{
  problem: string;                    // Problem description (required)
  methodology?: string;               // Approach: "top-down" | "bottom-up" | "feature-driven"
  objectives?: string[];              // Success criteria
  decomposition?: Array<{
    id: string;
    description: string;
    category: string;                 // "feature" | "infrastructure" | "investigation"
    complexity: string;               // "low" | "medium" | "high" | "very-high"
    priority: string;                 // "low" | "medium" | "high" | "critical"
    effortEstimate?: string;
    dependencies?: string[];
    acceptanceCriteria?: Array<{
      description: string;
      measurable: boolean;
      priority: string;
      testable: boolean;
    }>;
    risks?: Array<{
      description: string;
      probability: number;
      impact: string;
      category: string;
      mitigation: string;
    }>;
    stakeholders?: Array<{
      name: string;
      role: string;
      influence: string;
      interest: string;
    }>;
  }>;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│    🔧 Problem Decomposition      │
├─────────────────────────────────┤
│ Problem: [problem statement]    │
│ Methodology: [approach]         │
│ Components: [count]             │
│                                 │
│ High Priority:                  │
│ • [component 1]                 │
│ • [component 2]                 │
│                                 │
│ Dependencies Identified: [count]│
└─────────────────────────────────┘
```

**Usage Notes**:
- Excellent for project planning and feature breakdown
- Identifies dependencies and risks early
- Supports different decomposition methodologies
- Can include effort estimates and stakeholder analysis

---

### recursive_thinking

**Purpose**: Apply recursive strategies to problems with self-similar structure.

**Input Parameters**:
```typescript
{
  problem: string;                    // Problem description (required)
  baseCases: Array<{
    condition: string;
    solution: string;
    complexity?: string;
  }>;
  recursiveCases: Array<{
    condition: string;
    decomposition: string;
    recombination: string;
    reductionFactor: string;
  }>;
  terminationConditions: string[];
  optimizations?: Array<{
    technique: string;
    description: string;
    implementation: string;
    complexityImprovement: string;
    tradeoffs?: string[];
  }>;
  complexityAnalysis?: {
    timeComplexity: string;
    spaceComplexity: string;
    maxStackDepth: string;
  };
  domain?: string;
  problemId?: string;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     🔄 Recursive Thinking        │
├─────────────────────────────────┤
│ Problem: [problem description]  │
│ Base Cases: [count]             │
│ Recursive Cases: [count]        │
│                                 │
│ Complexity: [time/space]        │
│ Optimizations: [techniques]     │
│                                 │
│ Termination: [conditions]       │
└─────────────────────────────────┘
```

**Usage Notes**:
- Best for problems with recursive structure (trees, fractals, etc.)
- Includes complexity analysis and optimization strategies
- Helps identify base cases and recursive relationships
- Useful for algorithm design and mathematical problems

---

### mental_model

**Purpose**: Apply established mental models and thinking frameworks to problems.

**Input Parameters**:
```typescript
{
  modelName: string;                  // Name of mental model (required)
  problem: string;                    // Problem description (required)
  steps?: string[];                   // Analysis steps
  reasoning?: string;                 // Reasoning process
  conclusion?: string;                // Final conclusion
  alternativeModels?: string[];       // Other applicable models
  confidence?: number;                // Confidence in analysis (0-1)
  context?: string;                   // Additional context
}
```

**Popular Mental Models**:
- First Principles
- Second-Order Thinking
- Inversion
- Occam's Razor
- Circle of Competence
- Opportunity Cost
- Systems Thinking
- Hanlon's Razor
- Pareto Principle
- Jobs-to-be-Done

**Output Format**:
```
┌─────────────────────────────────┐
│      🧠 Mental Model             │
├─────────────────────────────────┤
│ Model: [model name]             │
│ Problem: [problem summary]      │
│                                 │
│ Analysis:                       │
│ • [step 1]                      │
│ • [step 2]                      │
│                                 │
│ Conclusion: [conclusion]        │
│ Confidence: [level]             │
└─────────────────────────────────┘
```

**Usage Notes**:
- Powerful for strategic thinking and decision making
- Choose models that fit the problem domain
- Can suggest alternative models for comparison
- Includes confidence scoring for self-assessment

---

### decision_framework

**Purpose**: Structured decision analysis with multiple criteria and alternatives.

**Input Parameters**:
```typescript
{
  decisionStatement: string;          // Decision to make (required)
  options: Array<{
    name: string;
    description: string;
    pros?: string[];
    cons?: string[];
  }>;
  analysisType: string;               // "simple-comparison" | "multi-criteria" | "cost-benefit"
  criteria?: Array<{
    name: string;
    description: string;
    weight: number;                   // 0-1, should sum to 1
    evaluationMethod: string;         // "quantitative" | "qualitative"
  }>;
  stage?: string;                     // "problem-definition" | "evaluation" | "decision"
  constraints?: string[];
  decisionId?: string;
  iteration?: number;
  nextStageNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│    ⚖️ Decision Framework          │
├─────────────────────────────────┤
│ Decision: [statement]           │
│ Options: [count]                │
│ Criteria: [count]               │
│                                 │
│ Recommended: [option]           │
│ Confidence: [score]             │
│                                 │
│ Key Factors:                    │
│ • [factor 1]: [weight]          │
│ • [factor 2]: [weight]          │
└─────────────────────────────────┘
```

**Usage Notes**:
- Excellent for complex decisions with multiple factors
- Supports weighted criteria and scoring
- Can handle quantitative and qualitative factors
- Iterative process for refining decisions

---

### domain_modeling

**Purpose**: Create conceptual models of problem domains with entities, relationships, and rules.

**Input Parameters**:
```typescript
{
  domainName: string;                 // Domain name (required)
  description: string;                // Domain description (required)
  entities: Array<{
    name: string;
    description: string;
    attributes: string[];
    behaviors: string[];
    constraints: string[];
  }>;
  relationships: Array<{
    name: string;
    type: string;                     // "one-to-one" | "one-to-many" | "many-to-many"
    sourceEntity: string;
    targetEntity: string;
    description: string;
    cardinality: string;
    implementation?: string;
  }>;
  domainRules?: Array<{
    name: string;
    description: string;
    type: string;                     // "business-rule" | "validation" | "invariant"
    entities: string[];
    condition: string;
    consequence: string;
    implementation?: string;
  }>;
  stage?: string;                     // "conceptual" | "logical" | "implementation"
  abstractionLevel?: string;          // "high" | "medium" | "detailed"
  paradigm?: string;                  // "oop" | "functional" | "active-record"
  modelingId?: string;
  iteration?: number;
  nextStageNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│      🏗️ Domain Modeling           │
├─────────────────────────────────┤
│ Domain: [domain name]           │
│ Entities: [count]               │
│ Relationships: [count]          │
│ Rules: [count]                  │
│                                 │
│ Core Entities:                  │
│ • [entity 1]: [attributes]      │
│ • [entity 2]: [attributes]      │
│                                 │
│ Key Relationships:              │
│ • [relationship]: [type]        │
└─────────────────────────────────┘
```

**Usage Notes**:
- Essential for understanding complex problem domains
- Supports different modeling paradigms (OOP, functional, etc.)
- Includes business rules and validation constraints
- Iterative refinement from conceptual to implementation

---

### scientific_method

**Purpose**: Formal hypothesis testing and experimental design.

**Input Parameters**:
```typescript
{
  stage: string;                      // "observation" | "hypothesis" | "experiment" | "analysis"
  observation?: string;               // Initial observation
  question?: string;                  // Research question
  hypothesis?: {
    statement: string;
    variables: Array<{
      name: string;
      type: string;                   // "independent" | "dependent" | "control"
      operationalization: string;
    }>;
    assumptions: string[];
    hypothesisId?: string;
    confidence?: number;
    domain?: string;
    iteration?: number;
    status?: string;                  // "draft" | "testing" | "validated" | "rejected"
  };
  experiment?: {
    design: string;
    methodology: string;
    predictions: Array<{
      if: string;
      then: string;
      else: string;
    }>;
    controlMeasures: string[];
    experimentId?: string;
    hypothesisId?: string;
  };
  results?: {
    data: string;
    analysis: string;
    conclusion: string;
    confidence: number;
    limitations: string[];
  };
  inquiryId?: string;
  iteration?: number;
  nextStageNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     🔬 Scientific Method         │
├─────────────────────────────────┤
│ Stage: [current stage]          │
│ Question: [research question]   │
│                                 │
│ Hypothesis:                     │
│ [hypothesis statement]          │
│                                 │
│ Variables:                      │
│ • Independent: [variable]       │
│ • Dependent: [variable]         │
│                                 │
│ Confidence: [level]             │
│ Next: [next stage]              │
└─────────────────────────────────┘
```

**Usage Notes**:
- Structured approach to testing assumptions
- Supports full experimental lifecycle
- Includes statistical considerations
- Excellent for A/B testing and performance optimization

---

### critical_thinking

**Purpose**: Systematic evaluation of arguments, assumptions, and potential issues.

**Input Parameters**:
```typescript
{
  subject: string;                    // Subject of analysis (required)
  potentialIssues?: Array<{
    description: string;
    severity: string;                 // "low" | "medium" | "high" | "critical"
    category: string;                 // "logical" | "factual" | "methodological" | "ethical"
    likelihood?: number;              // 0-1
    mitigation?: string;
  }>;
  edgeCases?: Array<{
    scenario: string;
    conditions: string[];
    currentBehavior: string;
    expectedBehavior: string;
    testability: string;              // "low" | "medium" | "high"
    businessImpact: string;           // "low" | "medium" | "high"
  }>;
  invalidAssumptions?: Array<{
    statement: string;
    validity: string;                 // "valid" | "invalid" | "questionable" | "contextual"
    verification: string;
    consequences?: string;
    dependencies?: string[];
  }>;
  alternativeApproaches?: Array<{
    name: string;
    description: string;
    advantages: string[];
    disadvantages: string[];
    complexity: string;               // "low" | "medium" | "high"
    feasibility: number;              // 0-1
    timeToImplement: string;
  }>;
  analysisDepth?: string;             // "surface" | "moderate" | "comprehensive"
  confidenceLevel?: number;           // 0-1
  analysisId?: string;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     🤔 Critical Thinking         │
├─────────────────────────────────┤
│ Subject: [analysis subject]     │
│                                 │
│ Potential Issues: [count]       │
│ • [high severity issue]         │
│ • [medium severity issue]       │
│                                 │
│ Questionable Assumptions:       │
│ • [assumption 1]                │
│                                 │
│ Alternatives: [count]           │
│ Confidence: [level]             │
└─────────────────────────────────┘
```

**Usage Notes**:
- Excellent for risk assessment and due diligence
- Identifies edge cases and failure modes
- Questions assumptions and biases
- Suggests alternative approaches

---

### debugging_approach

**Purpose**: Systematic troubleshooting methodologies for technical problems.

**Input Parameters**:
```typescript
{
  approachName: string;               // Debugging approach (required)
  issue: string;                      // Problem description (required)
  classification?: {
    category: string;                 // "performance" | "functional" | "security" | "data"
    severity: string;                 // "low" | "medium" | "high" | "critical"
    priority: string;                 // "low" | "medium" | "high" | "urgent"
    impact: string;                   // "user-facing" | "internal" | "data-integrity"
    frequency: string;                // "once" | "intermittent" | "always"
  };
  steps?: string[];                   // Debugging steps
  hypotheses?: Array<{
    statement: string;
    confidence: number;               // 0-1
    status: string;                   // "untested" | "testing" | "confirmed" | "rejected"
    testPlan: string;
  }>;
  findings?: string;                  // What was discovered
  resolution?: string;                // How it was resolved
  preventionMeasures?: string[];      // How to prevent recurrence
  toolsUsed?: string[];              // Debugging tools employed
  timeSpent?: string;                // Time invested
  debuggingId?: string;
}
```

**Common Approaches**:
- Binary Search
- Divide and Conquer
- Rubber Duck Debugging
- Reproduction Steps
- Log Analysis
- Performance Profiling
- Root Cause Analysis

**Output Format**:
```
┌─────────────────────────────────┐
│     🐞 Debugging Approach        │
├─────────────────────────────────┤
│ Approach: [method name]         │
│ Issue: [problem summary]        │
│ Severity: [level]               │
│                                 │
│ Steps:                          │
│ 1. [step 1]                     │
│ 2. [step 2]                     │
│                                 │
│ Hypotheses: [count]             │
│ Status: [current status]        │
└─────────────────────────────────┘
```

**Usage Notes**:
- Systematic approach to technical problem-solving
- Supports different debugging methodologies
- Tracks hypotheses and their validation
- Includes prevention measures for future

---

### collaborative_reasoning

**Purpose**: Multi-perspective problem solving with diverse personas and viewpoints.

**Input Parameters**:
```typescript
{
  topic: string;                      // Discussion topic (required)
  personas?: Array<{
    id: string;
    name: string;
    expertise: string[];
    background: string;
    perspective: string;
    biases?: string[];
    communication?: {
      style: string;                  // "analytical" | "creative" | "practical"
      tone: string;                   // "formal" | "casual" | "diplomatic"
    };
  }>;
  contributions?: Array<{
    personaId: string;
    content: string;
    type: string;                     // "proposal" | "concern" | "question" | "synthesis"
    confidence?: number;              // 0-1
    referencesTo?: string[];          // Other contributions
  }>;
  stage?: string;                     // "setup" | "discussion" | "synthesis" | "conclusion"
  consensusLevel?: number;            // 0-1, how much agreement
  activePersonaId?: string;
  sessionId?: string;
  iteration?: number;
  nextContributionNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│   👥 Collaborative Reasoning     │
├─────────────────────────────────┤
│ Topic: [discussion topic]       │
│ Personas: [count]               │
│ Stage: [current stage]          │
│                                 │
│ [Persona 1]: [perspective]      │
│ [Persona 2]: [perspective]      │
│                                 │
│ Consensus: [level]              │
│ Next: [next contribution]       │
└─────────────────────────────────┘
```

**Usage Notes**:
- Simulates team discussions and code reviews
- Diverse perspectives reveal blind spots
- Supports iterative consensus building
- Maintains session state across conversations

---

### structured_argumentation

**Purpose**: Dialectical reasoning and formal argument analysis.

**Input Parameters**:
```typescript
{
  claim: string;                      // Main claim (required)
  premises?: string[];                // Supporting premises
  conclusion?: string;                // Conclusion drawn
  argumentType?: string;              // "deductive" | "inductive" | "abductive"
  confidence?: number;                // 0-1
  strengths?: string[];               // Argument strengths
  weaknesses?: string[];              // Argument weaknesses
  counterarguments?: Array<{
    claim: string;
    evidence: string[];
    strength: string;                 // "weak" | "moderate" | "strong"
  }>;
  evidence?: Array<{
    type: string;                     // "empirical" | "logical" | "anecdotal"
    source: string;
    reliability: string;              // "low" | "medium" | "high"
    relevance: string;                // "low" | "medium" | "high"
  }>;
  logicalFallacies?: Array<{
    type: string;
    description: string;
    location: string;                 // Where in argument
  }>;
  argumentId?: string;
  iteration?: number;
  nextArgumentNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│   ⚖️ Structured Argumentation     │
├─────────────────────────────────┤
│ Claim: [main claim]             │
│                                 │
│ Premises:                       │
│ • [premise 1]                   │
│ • [premise 2]                   │
│                                 │
│ Conclusion: [conclusion]        │
│ Confidence: [level]             │
│                                 │
│ Strengths: [count]              │
│ Weaknesses: [count]             │
└─────────────────────────────────┘
```

**Usage Notes**:
- Formal analysis of arguments and reasoning
- Identifies logical fallacies and weak points
- Supports different argument types
- Includes counter-argument analysis

---

### metacognitive_monitoring

**Purpose**: Self-assessment of knowledge, reasoning quality, and cognitive processes.

**Input Parameters**:
```typescript
{
  task: string;                       // Task being monitored (required)
  stage: string;                      // "planning" | "execution" | "evaluation"
  overallConfidence?: number;         // 0-1
  knowledgeAssessment?: {
    domain: string;
    knowledgeLevel: string;           // "novice" | "intermediate" | "expert"
    confidenceScore: number;          // 0-1
    supportingEvidence: string;
    knownLimitations: string[];
  };
  claims?: Array<{
    claim: string;
    status: string;                   // "certain" | "probable" | "uncertain" | "hypothesis"
    confidenceScore: number;          // 0-1
    evidenceBasis: string;
    potentialBiases?: string[];
  }>;
  uncertaintyAreas?: string[];
  cognitiveProcesses?: Array<{
    process: string;                  // "analysis" | "synthesis" | "evaluation"
    effectiveness: string;            // "low" | "medium" | "high"
    improvements: string[];
  }>;
  recommendedApproach?: string;
  monitoringId?: string;
  iteration?: number;
  nextAssessmentNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│   🧠 Metacognitive Monitoring    │
├─────────────────────────────────┤
│ Task: [task description]        │
│ Stage: [current stage]          │
│ Confidence: [overall level]     │
│                                 │
│ Knowledge Level: [assessment]   │
│ Certainty Areas: [count]        │
│ Uncertainty Areas: [count]      │
│                                 │
│ Recommended: [approach]         │
│ Next Assessment: [needed]       │
└─────────────────────────────────┘
```

**Usage Notes**:
- Self-reflection and cognitive awareness
- Identifies knowledge gaps and biases
- Monitors reasoning quality over time
- Improves decision-making through self-awareness

---

### visual_reasoning

**Purpose**: Diagram-based thinking and spatial problem solving.

**Input Parameters**:
```typescript
{
  operation: string;                  // "create" | "analyze" | "transform"
  diagramId?: string;
  diagramType?: string;               // "flowchart" | "mind-map" | "network" | "tree-diagram"
  purpose?: string;                   // What the diagram is for
  elements?: Array<{
    id: string;
    type: string;                     // "node" | "edge" | "group"
    label: string;
    properties?: {
      position?: { x: number; y: number };
      style?: { color: string; size: string };
      semantics?: { [key: string]: any };
    };
    connectedTo?: string[];
  }>;
  transformationType?: string;        // "optimization" | "simplification" | "expansion"
  transformationDetails?: {
    target: string[];
    rationale: string;
    parameters: { [key: string]: any };
  };
  observation?: string;               // What you notice
  insight?: string;                   // What you learned
  iteration?: number;
  nextOperationNeeded?: boolean;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     👁️ Visual Reasoning           │
├─────────────────────────────────┤
│ Operation: [operation type]     │
│ Diagram: [type]                 │
│ Elements: [count]               │
│                                 │
│ Key Insights:                   │
│ • [insight 1]                   │
│ • [insight 2]                   │
│                                 │
│ Transformations: [count]        │
│ Next: [next operation]          │
└─────────────────────────────────┘
```

**Usage Notes**:
- Excellent for system design and architecture
- Supports multiple diagram types
- Can analyze existing diagrams or create new ones
- Includes transformation and optimization operations

---

### temporal_thinking

**Purpose**: Time-based system analysis with states, events, and transitions.

**Input Parameters**:
```typescript
{
  context: string;                    // System context (required)
  initialState: string;               // Starting state (required)
  states: Array<{
    name: string;
    description: string;
    properties?: {
      duration?: { typical: string; max: string; timeout?: string };
      isStable?: boolean;
      isFinal?: boolean;
      priority?: string;              // "low" | "medium" | "high" | "critical"
    };
    entryActions?: string[];
    exitActions?: string[];
    invariants?: string[];
  }>;
  events?: Array<{
    name: string;
    description: string;
    properties?: {
      type: string;                   // "user" | "system" | "external" | "timeout"
      predictability: string;         // "deterministic" | "stochastic" | "chaotic"
    };
    triggers?: string[];
    preconditions?: string[];
  }>;
  transitions: Array<{
    from: string;
    to: string;
    event: string;
    properties?: {
      probability?: number;           // 0-1
      latency?: string;
      maxRetries?: number;
    };
    guard?: string;                   // Condition for transition
    action?: string;                  // Action during transition
  }>;
  timeConstraints?: Array<{
    description: string;
    type: string;                     // "end-to-end" | "state-timeout" | "event-deadline"
    value: string;
    state?: string;
  }>;
  analysis?: {
    criticalPaths?: Array<{
      path: string[];
      probability: number;
      duration: string;
    }>;
    bottlenecks?: Array<{
      state: string;
      reason: string;
      impact: string;                 // "low" | "medium" | "high" | "critical"
    }>;
  };
  modelId?: string;
  domain?: string;
  purpose?: string;
}
```

**Output Format**:
```
┌─────────────────────────────────┐
│     ⏰ Temporal Thinking          │
├─────────────────────────────────┤
│ Context: [system context]       │
│ States: [count]                 │
│ Transitions: [count]            │
│                                 │
│ Critical Path:                  │
│ [state1] → [state2] → [state3]  │
│                                 │
│ Bottlenecks: [count]            │
│ Time Constraints: [count]       │
│                                 │
│ Analysis: [insights]            │
└─────────────────────────────────┘
```

**Usage Notes**:
- Automatically generates Mermaid state diagrams
- Excellent for modeling user flows and system processes
- Includes timing analysis and bottleneck identification
- Supports probabilistic transitions and analysis

---

### stochastic_algorithm

**Purpose**: Probabilistic algorithms for decision-making under uncertainty.

**Input Parameters**:
```typescript
{
  algorithm: string;                  // Algorithm type (required)
  problem: string;                    // Problem description (required)
  parameters?: { [key: string]: string };
  initialState?: string;
  actions?: string[];
  states?: string[];
  rewards?: { [key: string]: number };
  transitionProbabilities?: { [key: string]: number };
  explorationStrategy?: string;
  convergenceCriteria?: string;
  iterations?: number;
  result?: string;
  performance?: {
    convergenceRate?: number;
    optimalityGap?: number;
    computationalCost?: string;
  };
  algorithmId?: string;
}
```

**Algorithm Types**:
- **Markov Decision Process (MDP)**: Sequential decision-making with states and rewards
- **Monte Carlo Tree Search (MCTS)**: Game playing and strategic planning
- **Multi-Armed Bandit**: A/B testing and resource allocation
- **Bayesian Optimization**: Hyperparameter tuning and function optimization
- **Hidden Markov Model (HMM)**: Time series analysis and pattern recognition

**Output Format**:
```
┌─────────────────────────────────┐
│   🎲 Stochastic Algorithm        │
├─────────────────────────────────┤
│ Algorithm: [algorithm name]     │
│ Problem: [problem summary]      │
│                                 │
│ Parameters:                     │
│ • [param 1]: [value]            │
│ • [param 2]: [value]            │
│                                 │
│ Result: [algorithm result]      │
│ Performance: [metrics]          │
│                                 │
│ Recommendation: [action]        │
└─────────────────────────────────┘
```

**Usage Notes**:
- Handles uncertainty and probabilistic reasoning
- Supports multiple algorithm types for different problem domains
- Includes performance metrics and convergence analysis
- Excellent for optimization and machine learning problems

---

## Tool Combination Patterns

### Common Workflows

1. **Planning & Execution**:
   - sequential_thinking → problem_decomposition → temporal_thinking

2. **Decision Making**:
   - critical_thinking → collaborative_reasoning → decision_framework

3. **Problem Solving**:
   - debugging_approach → scientific_method → metacognitive_monitoring

4. **System Design**:
   - domain_modeling → visual_reasoning → temporal_thinking

5. **Strategy Development**:
   - mental_model → structured_argumentation → decision_framework

### Advanced Combinations

- **Recursive Problem Solving**: recursive_thinking + problem_decomposition
- **Multi-Perspective Analysis**: collaborative_reasoning + critical_thinking + structured_argumentation
- **Experimental Design**: scientific_method + stochastic_algorithm + metacognitive_monitoring
- **Complex System Modeling**: domain_modeling + temporal_thinking + visual_reasoning

## Performance and Limitations

### Execution Times
- Simple tools (debugging_approach, mental_model): <100ms
- Medium complexity (sequential_thinking, decision_framework): 100-300ms
- Complex tools (visual_reasoning, temporal_thinking): 300-1000ms
- Stochastic algorithms: 500-2000ms (depends on iterations)

### Memory Usage
- Most tools are stateless and use minimal memory
- Stateful tools (sequential_thinking, collaborative_reasoning) maintain session data
- Complex visualizations may require more memory for diagram generation

### Best Practices
1. Start with simple parameters and add complexity gradually
2. Use tool combinations for comprehensive analysis
3. Leverage iteration capabilities for refinement
4. Monitor confidence levels and uncertainty
5. Validate results with multiple approaches

---

*For implementation details and advanced usage patterns, see [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md).*