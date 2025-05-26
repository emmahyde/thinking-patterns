# Thinking Patterns MCP Server

A comprehensive Model Context Protocol (MCP) server that combines systematic thinking, mental models, debugging approaches, and stochastic algorithms for enhanced problem-solving capabilities. This server merges the functionality of Clear Thought and Stochastic Thinking servers into a unified cognitive toolkit.

## Features

### Mental Models
- First Principles Thinking
- Opportunity Cost Analysis
- Error Propagation Understanding
- Rubber Duck Debugging
- Pareto Principle
- Occam's Razor

### Debugging Approaches
- Binary Search
- Reverse Engineering
- Divide and Conquer
- Backtracking
- Cause Elimination
- Program Slicing

### 💭 Sequential Thinking
- Structured thought process with branching support
- Revision and context maintenance
- Dynamic adjustment of thought sequences
- Multi-step problem solving

### 🎲 Stochastic Algorithms
- **Markov Decision Processes (MDPs)**: Optimize policies over long sequences of decisions
- **Monte Carlo Tree Search (MCTS)**: Simulate future action sequences for large decision spaces
- **Multi-Armed Bandit**: Balance exploration vs exploitation in action selection
- **Bayesian Optimization**: Optimize decisions with probabilistic inference
- **Hidden Markov Models (HMMs)**: Infer latent states affecting decision outcomes

### 🤝 Advanced Cognitive Tools
- **Collaborative Reasoning**: Multi-perspective problem solving
- **Decision Frameworks**: Structured decision analysis and rational choice
- **Metacognitive Monitoring**: Self-assessment of knowledge and reasoning quality
- **Scientific Method**: Formal hypothesis testing and experimentation
- **Structured Argumentation**: Dialectical reasoning and argument analysis
- **Visual Reasoning**: Diagram-based thinking and problem solving

## Installation

### Installing via Smithery

To install Thinking Patterns MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@emmahyde/thought-patterns):

```bash
npx -y @smithery/cli install @emmahyde/thought-patterns --client claude
```

### Manual Installation
```bash
npm install @emmahyde/thought-patterns
```

Or run with npx:

```bash
npx @waldzellai/thinking-patterns
```

## Usage Examples

### Mental Models
```typescript
const response = await mcp.callTool("mentalmodel", {
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
const response = await mcp.callTool("sequentialthinking", {
  thought: "Initial analysis of the problem",
  thoughtNumber: 1,
  totalThoughts: 3,
  nextThoughtNeeded: true
});
```

### Stochastic Algorithms
```typescript
// Markov Decision Process
const response = await mcp.callTool("stochasticalgorithm", {
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
const response = await mcp.callTool("stochasticalgorithm", {
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
const response = await mcp.callTool("debuggingapproach", {
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
const response = await mcp.callTool("collaborativereasoning", {
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

## Tool Selection Guide

### When to Use Each Tool

**Mental Models**: Best for initial problem understanding, breaking down complex systems, analyzing trade-offs, and finding root causes.

**Sequential Thinking**: Ideal for complex multi-step analysis, decision refinement, comprehensive planning, and problems requiring iterative thinking.

**Debugging Approaches**: Perfect for troubleshooting issues, performance optimization, system analysis, and error resolution.

**Stochastic Algorithms**: Essential for decision-making under uncertainty, optimization problems, resource allocation, and probabilistic modeling.

**Advanced Cognitive Tools**: Use for complex collaborative analysis, formal decision-making, scientific reasoning, and structured argumentation.

### Algorithm Selection Guide

**Markov Decision Processes**: Sequential decision-making with clear state transitions and defined rewards.

**Monte Carlo Tree Search**: Game playing, strategic planning, large decision spaces where simulation is possible.

**Multi-Armed Bandit**: A/B testing, resource allocation, online advertising, quick adaptation needs.

**Bayesian Optimization**: Hyperparameter tuning, expensive function optimization, continuous parameter spaces.

**Hidden Markov Models**: Time series analysis, pattern recognition, state inference, sequential data modeling.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Start the server: `npm start`

## Docker

Build the Docker image:

```bash
docker build -t emmahyde/thinking-patterns .
```

Run the container:

```bash
docker run -it emmahyde/thinking-patterns
```

## Available Tools

1. **sequentialthinking** - Dynamic multi-step thinking with revision support
2. **mentalmodel** - Structured mental models for problem-solving
3. **debuggingapproach** - Systematic debugging methodologies
4. **stochasticalgorithm** - Probabilistic algorithms for decision-making under uncertainty
5. **collaborativereasoning** - Multi-perspective collaborative problem solving
6. **decisionframework** - Structured decision analysis and rational choice
7. **metacognitivemonitoring** - Self-assessment of knowledge and reasoning quality
8. **scientificmethod** - Formal hypothesis testing and experimentation
9. **structuredargumentation** - Dialectical reasoning and argument analysis
10. **visualreasoning** - Diagram-based thinking and problem solving

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Acknowledgments

- Based on the Model Context Protocol (MCP) by Anthropic
- Combines functionality from Clear Thought and Stochastic Thinking MCP servers
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models)
- Stochastic algorithms based on classic works in reinforcement learning and decision theory
