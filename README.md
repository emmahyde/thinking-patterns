# Thinking Patterns MCP Server

[![smithery badge](https://smithery.ai/badge/@emmahyde/thinking-patterns)](https://smithery.ai/server/@emmahyde/thinking-patterns)
[![NPM Version](https://img.shields.io/npm/v/%40emmahyde%2Fthinking-patterns)](https://www.npmjs.com/package/@emmahyde/thinking-patterns)

## TL;DR
A comprehensive MCP server that provides AI systems with structured thinking frameworks that follow existing problem-solving paradigms. Transform abstract cognitive patterns into concrete, invocable tools. Enforces adherence to the paradigms through schema validation.

## 📚 Documentation

- **[Quick Start](#quick-start)** - Get up and running in 2 minutes
- **[TOOL_REFERENCE.md](./TOOL_REFERENCE.md)** - Complete tool specifications and parameters
- **[EXAMPLES.md](./EXAMPLES.md)** - Detailed usage examples and patterns
- **[SUMMARY.md](./SUMMARY.md)** - Executive summary and overview
- **[SYSTEM_INTENT.md](./SYSTEM_INTENT.md)** - System purpose and philosophy
- **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** - Technical implementation details

## Problem
LLMs struggle to maintain consistent reasoning patterns throughout extended conversations due to context window limitations and degrading adherence to initial instructions. Traditional approaches like "keep X in mind" or role-based prompting fail when:

- Critical context passes out of the attention window
- Models acknowledge constraints but don't consistently apply them
- Reasoning structures decay over multi-turn interactions

`thinking-patterns` enforces structural consistency through interactive schema validation rather than passive instruction-following.

## Solution

`thinking-patterns` works by implicitly encouraging good engineering behaviors and approaches:

- Schema validation ensures reasoning patterns persist beyond context window limits
- Structural requirements live in tool definitions rather than repeated prompt text, reducing token overhead
- Tool interaction success/failure provides objective metrics for reasoning quality
  - Indicates to the model that they are not following the pattern appropriately without additional user interaction
- Reusable thinking structures across different problem domains

### Reasoning Improvements

- **Attention Drift Prevention:** Without structural anchors, models experience "goal drift" as new contextual information competes with original objectives. Schema validation creates persistent attention anchors.
- **State Crystallization:** Explicit articulation of reasoning state (forced by tool parameters) appears to strengthen internal representation compared to implicit state maintenance. Models demonstrate measurably better state consistency when reasoning is externalized.
- **Error-Driven Learning:** Schema validation errors create immediate, interactive corrective feedback loops within a single response, unlike instruction-based approaches where non-compliance often goes undetected until task completion.
- **Cognitive Load Distribution:** Externalizing structural requirements to schemas allows models to allocate more processing capacity to problem-solving rather than format compliance, similar to how humans benefit from external memory aids.
- **Iterative Reinforcement:** Repeated successful tool interactions strengthen adherence patterns through practice, creating compound consistency benefits over conversation length.

## 🚀 Quick Start

### 1. Install (Choose One)

**Recommended: Smithery (for Cursor users)**
```bash
npx -y @smithery/cli install @emmahyde/thinking-patterns --client cursor
```

**NPM**
```bash
npm install @emmahyde/thinking-patterns
```

**NPX (no installation)**
```bash
npx -y @emmahyde/thinking-patterns
```

### 2. Configure MCP Client

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "thinking-patterns": {
      "command": "npx",
      "args": ["-y", "@emmahyde/thinking-patterns"]
    }
  }
}
```

### 3. Try Your First Tool

```bash
# Example: Use sequential thinking for planning
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Plan a product launch strategy",
    "thoughtNumber": 1,
    "totalThoughts": 5
  }
}
```

## 🧠 Available Thinking Tools

### Core Systematic Thinking
- **sequential_thinking** - Multi-step reasoning with revision support
- **problem_decomposition** - Break complex problems into manageable parts
- **recursive_thinking** - Apply recursive strategies to self-similar problems

### Mental Models & Frameworks
- **mental_model** - Apply proven frameworks (First Principles, Inversion, etc.)
- **decision_framework** - Multi-criteria decision analysis
- **domain_modeling** - Create conceptual models of problem domains

### Scientific & Critical Analysis
- **scientific_method** - Formal hypothesis testing and experimentation
- **critical_thinking** - Systematic evaluation of arguments and assumptions
- **debugging_approach** - Systematic troubleshooting methodologies

### Collaborative & Dialectical
- **collaborative_reasoning** - Multi-perspective problem solving with personas
- **structured_argumentation** - Dialectical reasoning and argument analysis

### Advanced Cognitive Patterns
- **metacognitive_monitoring** - Self-assessment of reasoning quality
- **visual_reasoning** - Diagram-based thinking and spatial reasoning
- **temporal_thinking** - Time-based system analysis with state transitions

### Probabilistic & Optimization
- **stochastic_algorithm** - Decision-making under uncertainty
  - Markov Decision Processes (MDPs)
  - Monte Carlo Tree Search (MCTS)
  - Multi-Armed Bandit algorithms
  - Bayesian Optimization
  - Hidden Markov Models (HMMs)

## 💡 Recommended Starting Points

- **sequential_thinking** & **problem_decomposition** - Perfect for planning and breaking down complex tasks
- **debugging_approach** - Send error messages directly for systematic troubleshooting
- **collaborative_reasoning** - Simulate team discussions to uncover blind spots
- **temporal_thinking** - Auto-generates Mermaid diagrams for system flows

## 📋 Prerequisites

- Node.js 18+ (for local installation)
- MCP-compatible client (Claude, Cursor, etc.)
- Optional: Docker for containerized deployment

## 🔧 Installation Options

### Option 1: Smithery (Recommended for Cursor)

Automatically configures MCP client:
```bash
npx -y @smithery/cli install @emmahyde/thinking-patterns --client cursor
```

### Option 2: NPM Package

For local development:
```bash
npm install @emmahyde/thinking-patterns
```

### Option 3: NPX (Zero Installation)

Run without installing:
```bash
npx -y @emmahyde/thinking-patterns
```

### Option 4: Docker

```bash
# Build image
docker build -t thinking-patterns .

# Run container
docker run -it thinking-patterns
```

### Option 5: Development Setup

```bash
git clone https://github.com/emmahyde/thinking-patterns
cd thinking-patterns
npm install
npm run build
npm start
```

## 🐳 Docker Compose (Redis Support)

For session storage and caching:

```bash
# Start Redis service
docker compose up -d

# Verify Redis is running
docker compose ps

# Test Redis connectivity
docker compose exec redis redis-cli ping
```

## 🔍 Common Issues & Solutions

**Issue**: `service "redis" has no container to start`
- **Solution**: Use `docker compose up -d` instead of `docker compose start`

**Issue**: `error getting credentials - err: exec: "docker-credential-desktop"`
- **Solution**: `docker pull redis:alpine` then `docker compose up -d`

**Issue**: Tool not found
- **Solution**: Verify MCP client configuration and restart client

## 🎯 Use Cases

### Software Development
- Debug production issues systematically
- Decompose complex features into user stories
- Review code with multiple perspectives
- Plan architecture changes step-by-step

### Business Strategy
- Make data-driven decisions with frameworks
- Apply mental models to strategic planning
- Model business processes over time
- Optimize resource allocation

### Research & Analysis
- Test hypotheses with scientific method
- Evaluate arguments critically
- Model new domains systematically
- Analyze temporal patterns

### Creative Problem Solving
- Use visual reasoning for design challenges
- Apply recursive thinking to complex patterns
- Optimize solutions with probabilistic algorithms
- Generate innovative solutions with mental models

## 🔗 Integration Examples

### Cursor IDE
```json
{
  "mcpServers": {
    "thinking-patterns": {
      "command": "npx",
      "args": ["-y", "@emmahyde/thinking-patterns"]
    }
  }
}
```

### Claude Desktop
```json
{
  "mcpServers": {
    "thinking-patterns": {
      "command": "node",
      "args": ["/path/to/thinking-patterns/dist/index.js"]
    }
  }
}
```

## 📊 Tool Categories

| Category | Tools | Best For |
|----------|-------|----------|
| **Systematic** | sequential_thinking, problem_decomposition, recursive_thinking | Planning, breaking down complexity |
| **Mental Models** | mental_model, decision_framework, domain_modeling | Strategic thinking, decision making |
| **Scientific** | scientific_method, critical_thinking, debugging_approach | Analysis, troubleshooting, validation |
| **Collaborative** | collaborative_reasoning, structured_argumentation | Team thinking, debate, consensus |
| **Advanced** | metacognitive_monitoring, visual_reasoning, temporal_thinking | Self-reflection, design, process modeling |
| **Probabilistic** | stochastic_algorithm | Optimization, uncertainty, ML/AI |

## 🤝 Contributing

Contributions welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io) by Anthropic
- Mental Models framework inspired by cognitive science research
- Stochastic algorithms based on reinforcement learning and decision theory

## 📞 Support

- 📖 [Tool Reference](./TOOL_REFERENCE.md) - Complete API documentation
- 💡 [Examples Guide](./EXAMPLES.md) - Usage examples and patterns
- 🐛 [Report Issues](https://github.com/emmahyde/thinking-patterns/issues)
- 💬 [Discussions](https://github.com/emmahyde/thinking-patterns/discussions)

---

*Give an AI thinking patterns, and it can solve any problem systematically.*
