# Thinking Patterns MCP Server

[![smithery badge](https://smithery.ai/badge/@emmahyde/thinking-patterns)](https://smithery.ai/server/@emmahyde/thinking-patterns)
[![NPM Version](https://img.shields.io/npm/v/%40emmahyde%2Fthinking-patterns)](https://www.npmjs.com/package/@emmahyde/thinking-patterns)

A comprehensive Model Context Protocol (MCP) server that combines systematic thinking, mental models, debugging approaches, and stochastic algorithms for enhanced problem-solving capabilities. This server merges the functionality of Clear Thought and Stochastic Thinking servers into a unified cognitive toolkit.

## Features

### Available Tools

1. **sequential_thinking** - Dynamic multi-step thinking with revision support
2. **mental_model** - Structured mental models for problem-solving
3. **debugging_approach** - Systematic debugging methodologies
4. **stochastic_algorithm** - Probabilistic algorithms for decision-making under uncertainty
5. **collaborative_reasoning** - Multi-perspective collaborative problem solving
6. **decision_framework** - Structured decision analysis and rational choice
7. **metacognitive_monitoring** - Self-assessment of knowledge and reasoning quality
8. **scientific_method** - Formal hypothesis testing and experimentation
9. **structured_argumentation** - Dialectical reasoning and argument analysis
10. **visual_reasoning** - Diagram-based thinking and problem solving

### Stochastic Algorithm Selection Guide

**Markov Decision Processes**: Sequential decision-making with clear state transitions and defined rewards.

**Monte Carlo Tree Search**: Game playing, strategic planning, large decision spaces where simulation is possible.

**Multi-Armed Bandit**: A/B testing, resource allocation, online advertising, quick adaptation needs.

**Bayesian Optimization**: Hyperparameter tuning, expensive function optimization, continuous parameter spaces.

**Hidden Markov Models**: Time series analysis, pattern recognition, state inference, sequential data modeling.

## Installation

### Installing via Smithery

To install Thinking Patterns MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@emmahyde/thinking-patterns):

```bash
npx -y @smithery/cli install @emmahyde/thinking-patterns --client claude
```

### Manual Installation
```bash
npm install @emmahyde/thinking-patterns
```

Or run with npx:

```bash
npx @emmahyde/thinking-patterns
```

### Docker

Build the Docker image:

```bash
docker build -t emmahyde/thinking-patterns .
```

Run the container:

```bash
docker run -it emmahyde/thinking-patterns
```

### Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the server: `npm start`

## Usage Examples

### Mental Models
```typescript
const response = await mcp.callTool("mental_model", {
  modelName: "first_principles",
  problem: "How to implement a new feature?",
  steps: [
    "Break down the problem",
    "Analyze components",
    "Build solution"
  ]
});
```

### Sequential Thinking
```typescript
const response = await mcp.callTool("sequential_thinking", {
  thought: "Initial analysis of the problem",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
});
```

### Stochastic Algorithms
```typescript
// Markov Decision Process
const response = await mcp.callTool("stochastic_algorithm", {
  algorithm: "mdp",
  problem: "Optimize robot navigation policy",
  parameters: {
    states: 100,
    actions: ["up", "down", "left", "right"],
    gamma: 0.9,
    learningRate: 0.1
  }
});

// Monte Carlo Tree Search
const response = await mcp.callTool("stochastic_algorithm", {
  algorithm: "mcts",
  problem: "Find optimal game moves",
  parameters: {
    simulations: 1000,
    explorationConstant: 1.4,
    maxDepth: 10
  }
});
```

### Debugging Approaches
```typescript
const response = await mcp.callTool("debugging_approach", {
  approachName: "binary_search",
  issue: "Performance degradation in the system",
  steps: [
    "Identify performance metrics",
    "Locate bottleneck",
    "Implement solution"
  ]
});
```

### Collaborative Reasoning
```typescript
const response = await mcp.callTool("collaborative_reasoning", {
  topic: "System architecture decision",
  personas: [
    {
      id: "architect",
      name: "Senior Architect",
      expertise: ["distributed systems", "scalability"],
      background: "10+ years in system design",
      perspective: "Long-term maintainability focus",
      biases: ["over-engineering"],
      communication: { style: "analytical", tone: "measured" }
    }
  ],
  contributions: [],
  stage: "problem-definition",
  activePersonaId: "architect",
  sessionId: "session-1",
  iteration: 1,
  nextContributionNeeded: true
});
```

### Decision Framework
```typescript
const response = await mcp.callTool("decision_framework", {
  decisionContext: "Selecting a cloud provider",
  options: ["AWS", "GCP", "Azure"],
  criteria: ["cost", "scalability", "support"],
  weights: { cost: 0.5, scalability: 0.3, support: 0.2 },
  rationale: "Prioritize cost and scalability for a startup."
});
```

### Metacognitive Monitoring
```typescript
const response = await mcp.callTool("metacognitive_monitoring", {
  task: "Code review for critical bug fix",
  confidenceLevel: 0.7,
  knowledgeGaps: ["edge case handling"],
  reflection: "Need to double-check concurrency issues."
});
```

### Scientific Method
```typescript
const response = await mcp.callTool("scientific_method", {
  hypothesis: "Increasing cache size will improve response time",
  experiment: {
    control: { cacheSize: 128 },
    variant: { cacheSize: 512 },
    metric: "averageResponseTime"
  },
  results: null,
  nextStep: "Run A/B test and collect data"
});
```

### Structured Argumentation
```typescript
const response = await mcp.callTool("structured_argumentation", {
  claim: "Microservices are better than monoliths for scaling",
  argumentsFor: ["Independent deployment", "Fault isolation"],
  argumentsAgainst: ["Increased complexity", "Operational overhead"],
  conclusion: null
});
```

### Visual Reasoning
```typescript
const response = await mcp.callTool("visual_reasoning", {
  problem: "Optimize network topology",
  diagramType: "graph",
  nodes: ["A", "B", "C", "D"],
  edges: [
    { from: "A", to: "B" },
    { from: "B", to: "C" },
    { from: "C", to: "D" },
    { from: "A", to: "D" }
  ],
  transformation: "minimize total edge length"
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Acknowledgments

- Based on [the clear-thought server](https://github.com/waldzellai/waldzell-mcp), which is based on the Model Context Protocol (MCP) by Anthropic
- Combines functionality from Clear Thought and Stochastic Thinking MCP servers
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models)
- Stochastic algorithms based on classic works in reinforcement learning and decision theory
