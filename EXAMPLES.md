# Thinking Patterns - Usage Examples

This guide provides practical examples of using the Thinking Patterns MCP Server tools. Examples progress from simple to advanced usage patterns.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Tool-by-Tool Guide](#tool-by-tool-guide)
- [Real-World Scenarios](#real-world-scenarios)
- [Advanced Patterns](#advanced-patterns)

## Quick Start Examples

### Simple Planning with Sequential Thinking

```json
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Plan a weekend coding project to build a todo app",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "nextThoughtNeeded": true,
    "currentStep": {
      "stepDescription": "Define requirements and choose tech stack",
      "expectedOutcome": "Clear project scope and technology decisions"
    }
  }
}
```

### Quick Decision Making

```json
{
  "tool": "decision_framework",
  "arguments": {
    "decisionStatement": "Choose between React and Vue for new project",
    "options": [
      {"name": "React", "description": "Popular, large ecosystem"},
      {"name": "Vue", "description": "Simpler, gentle learning curve"}
    ],
    "analysisType": "simple-comparison",
    "stage": "evaluation"
  }
}
```

### Basic Problem Decomposition

```json
{
  "tool": "problem_decomposition",
  "arguments": {
    "problem": "Build user authentication system",
    "methodology": "top-down",
    "objectives": ["Secure login", "Password reset", "User sessions"]
  }
}
```

## Tool-by-Tool Guide

### 1. Sequential Thinking

**Purpose**: Multi-step reasoning with the ability to revise and branch thoughts.

**Basic Usage**:
```json
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Design database schema for e-commerce site",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "nextThoughtNeeded": true
  }
}
```

**Advanced Usage with Branching**:
```json
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "After considering the options, I'll explore the microservices approach",
    "thoughtNumber": 3,
    "totalThoughts": 5,
    "branchFromThought": 2,
    "branchReason": "Want to explore alternative architecture"
  }
}
```

### 2. Mental Model

**Purpose**: Apply proven thinking frameworks to problems.

**First Principles Thinking**:
```json
{
  "tool": "mental_model",
  "arguments": {
    "modelName": "First Principles",
    "problem": "Reduce website loading time from 5 seconds to under 2 seconds",
    "steps": [
      "Identify fundamental bottlenecks: network, rendering, JavaScript execution",
      "Question assumptions: Do we need all these features on initial load?",
      "Build solution from basic components: critical CSS, lazy loading, code splitting"
    ],
    "reasoning": "Breaking down to fundamentals reveals that most content isn't needed immediately",
    "conclusion": "Implement progressive loading strategy focusing on critical rendering path"
  }
}
```

**Second-Order Thinking**:
```json
{
  "tool": "mental_model",
  "arguments": {
    "modelName": "Second-Order Thinking",
    "problem": "Implement aggressive caching to improve performance",
    "steps": [
      "First-order: Caching improves response times",
      "Second-order: Cache invalidation becomes complex",
      "Third-order: Stale data could cause user trust issues",
      "Fourth-order: Complex cache strategy increases development time"
    ],
    "reasoning": "Need to consider cascading effects of caching decisions",
    "conclusion": "Implement simple cache strategy with clear invalidation rules"
  }
}
```

### 3. Debugging Approach

**Purpose**: Systematic troubleshooting methodologies.

**Performance Issue**:
```json
{
  "tool": "debugging_approach",
  "arguments": {
    "approachName": "Binary Search",
    "issue": "API response time increased from 200ms to 3s after deployment",
    "classification": {
      "category": "performance",
      "severity": "high",
      "priority": "urgent",
      "impact": "user-facing",
      "frequency": "always"
    },
    "steps": [
      "Identify midpoint: check if issue is in database or application layer",
      "Test database queries directly - measure execution time",
      "If DB is fast, check application code between old and new deployment",
      "If DB is slow, examine query plans and recent schema changes"
    ],
    "hypotheses": [
      {
        "statement": "New database migration created expensive query",
        "confidence": 0.7,
        "status": "testing",
        "testPlan": "Compare query execution plans before/after migration"
      }
    ]
  }
}
```

### 4. Collaborative Reasoning

**Purpose**: Multi-perspective problem solving with different personas.

**Code Review Simulation**:
```json
{
  "tool": "collaborative_reasoning",
  "arguments": {
    "topic": "Review implementation of new authentication middleware",
    "personas": [
      {
        "id": "security_expert",
        "name": "Security Engineer",
        "expertise": ["security", "cryptography", "vulnerabilities"],
        "perspective": "Security-first approach, identify potential attack vectors",
        "biases": ["over-emphasis on security", "complexity for security sake"]
      },
      {
        "id": "maintainer",
        "name": "Senior Developer",
        "expertise": ["code quality", "maintainability", "testing"],
        "perspective": "Long-term maintainability and team productivity",
        "biases": ["preference for familiar patterns", "risk aversion"]
      }
    ],
    "stage": "discussion",
    "sessionId": "auth-middleware-review"
  }
}
```

### 5. Scientific Method

**Purpose**: Formal hypothesis testing and experimentation.

**A/B Testing Hypothesis**:
```json
{
  "tool": "scientific_method",
  "arguments": {
    "stage": "hypothesis",
    "observation": "Users drop off at the payment page at 40% rate",
    "question": "Will simplifying the payment form increase conversion?",
    "hypothesis": {
      "statement": "Reducing payment form fields from 12 to 6 will increase conversion by 15%",
      "variables": [
        {
          "name": "form_complexity",
          "type": "independent",
          "operationalization": "Number of required fields in payment form"
        },
        {
          "name": "conversion_rate",
          "type": "dependent",
          "operationalization": "Percentage of users who complete payment"
        }
      ],
      "assumptions": ["Form complexity is the main barrier", "Users have payment intent"],
      "confidence": 0.75
    }
  }
}
```

## Real-World Scenarios

### Scenario 1: Rails Performance Investigation

**Context**: Production Rails app experiencing slow responses.

**Step 1: Problem Decomposition**
```json
{
  "tool": "problem_decomposition",
  "arguments": {
    "problem": "Rails app response time degraded from 200ms to 2000ms",
    "methodology": "root-cause-analysis",
    "decomposition": [
      {
        "id": "identify-bottleneck",
        "description": "Determine if issue is database, application, or network",
        "category": "investigation",
        "priority": "critical"
      },
      {
        "id": "analyze-recent-changes",
        "description": "Review deployments, migrations, and configuration changes",
        "category": "investigation",
        "priority": "high"
      }
    ]
  }
}
```

**Step 2: Systematic Debugging**
```json
{
  "tool": "debugging_approach",
  "arguments": {
    "approachName": "Performance Profiling",
    "issue": "Response time increased 10x after recent deployment",
    "steps": [
      "Enable Rails query logging and analyze N+1 queries",
      "Profile with rack-mini-profiler to identify slow components",
      "Check database query execution plans",
      "Review recent Active Record association changes"
    ],
    "findings": "New association loading 1000+ records without pagination"
  }
}
```

### Scenario 2: React Component Architecture Decision

**Context**: Choosing state management for growing React application.

**Step 1: Decision Framework**
```json
{
  "tool": "decision_framework",
  "arguments": {
    "decisionStatement": "Select state management solution for React e-commerce app",
    "options": [
      {"name": "Redux Toolkit", "description": "Battle-tested, predictable state"},
      {"name": "Zustand", "description": "Lightweight, simple API"},
      {"name": "Context + useReducer", "description": "Built-in React solution"}
    ],
    "criteria": [
      {
        "name": "Learning Curve",
        "weight": 0.25,
        "evaluationMethod": "qualitative"
      },
      {
        "name": "Bundle Size",
        "weight": 0.3,
        "evaluationMethod": "quantitative"
      },
      {
        "name": "Developer Experience",
        "weight": 0.45,
        "evaluationMethod": "qualitative"
      }
    ],
    "analysisType": "multi-criteria"
  }
}
```

**Step 2: Critical Thinking Analysis**
```json
{
  "tool": "critical_thinking",
  "arguments": {
    "subject": "Adopting Zustand for state management in production app",
    "potentialIssues": [
      {
        "description": "Smaller ecosystem compared to Redux",
        "severity": "medium",
        "category": "sustainability",
        "likelihood": 0.6
      }
    ],
    "invalidAssumptions": [
      {
        "statement": "Smaller bundle size always means better performance",
        "validity": "questionable",
        "verification": "Performance depends on usage patterns, not just bundle size"
      }
    ]
  }
}
```

### Scenario 3: System Design with Temporal Thinking

**Context**: Modeling a complex user onboarding flow.

```json
{
  "tool": "temporal_thinking",
  "arguments": {
    "context": "User onboarding for SaaS platform with email verification, profile setup, and payment",
    "initialState": "registration_started",
    "states": [
      {
        "name": "registration_started",
        "description": "User submitted email and password",
        "properties": {
          "duration": {"typical": "30s", "max": "5m"},
          "isStable": false
        },
        "entryActions": ["Send verification email", "Create pending user record"]
      },
      {
        "name": "email_verified",
        "description": "User clicked verification link",
        "properties": {
          "duration": {"typical": "2m", "max": "24h"},
          "isStable": false
        },
        "entryActions": ["Activate user account", "Redirect to profile setup"]
      },
      {
        "name": "profile_complete",
        "description": "User completed profile information",
        "properties": {
          "isStable": true,
          "isFinal": false
        },
        "entryActions": ["Enable core features", "Show payment options"]
      }
    ],
    "transitions": [
      {
        "from": "registration_started",
        "to": "email_verified",
        "event": "verification_clicked",
        "properties": {"probability": 0.75}
      },
      {
        "from": "email_verified",
        "to": "profile_complete",
        "event": "profile_submitted",
        "properties": {"probability": 0.85}
      }
    ]
  }
}
```

## Advanced Patterns

### Pattern 1: Combining Multiple Tools

**Use Case**: Complex feature planning combining sequential thinking and problem decomposition.

**Step 1**: High-level planning
```json
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Plan implementation of real-time chat feature",
    "thoughtNumber": 1,
    "totalThoughts": 4,
    "currentStep": {
      "stepDescription": "Break down into major components",
      "recommendedTools": [
        {
          "toolName": "problem_decomposition",
          "rationale": "Complex feature needs systematic breakdown"
        }
      ]
    }
  }
}
```

**Step 2**: Detailed breakdown
```json
{
  "tool": "problem_decomposition",
  "arguments": {
    "problem": "Implement real-time chat with message history, typing indicators, and file sharing",
    "methodology": "feature-driven",
    "decomposition": [
      {
        "id": "websocket-connection",
        "description": "Establish WebSocket connection management",
        "complexity": "medium",
        "dependencies": []
      },
      {
        "id": "message-storage",
        "description": "Design message persistence and retrieval",
        "complexity": "high",
        "dependencies": ["websocket-connection"]
      }
    ]
  }
}
```

### Pattern 2: Iterative Refinement

**Use Case**: Refining a solution through multiple iterations.

**Iteration 1**:
```json
{
  "tool": "domain_modeling",
  "arguments": {
    "domainName": "Chat Application",
    "entities": [
      {
        "name": "Message",
        "attributes": ["id", "content", "timestamp", "user_id"],
        "behaviors": ["send", "edit", "delete"]
      }
    ],
    "stage": "initial",
    "iteration": 1
  }
}
```

**Iteration 2** (after feedback):
```json
{
  "tool": "domain_modeling",
  "arguments": {
    "domainName": "Chat Application",
    "entities": [
      {
        "name": "Message",
        "attributes": ["id", "content", "timestamp", "user_id", "room_id", "message_type"],
        "behaviors": ["send", "edit", "delete", "reply", "react"],
        "constraints": ["Content max 4000 chars", "Edit within 5 minutes"]
      }
    ],
    "stage": "refinement",
    "iteration": 2,
    "previousIteration": 1
  }
}
```

### Pattern 3: Tool Chaining for Complex Analysis

**Use Case**: Comprehensive security review using multiple cognitive approaches.

**Step 1**: Critical thinking to identify potential issues
```json
{
  "tool": "critical_thinking",
  "arguments": {
    "subject": "New API authentication system using JWT tokens",
    "potentialIssues": [
      {
        "description": "JWT tokens can't be revoked once issued",
        "severity": "high",
        "category": "security"
      }
    ]
  }
}
```

**Step 2**: Collaborative reasoning for different perspectives
```json
{
  "tool": "collaborative_reasoning",
  "arguments": {
    "topic": "JWT revocation strategy for API security",
    "personas": [
      {
        "id": "security_architect",
        "name": "Security Architect",
        "perspective": "Defense-in-depth, assume breach mentality"
      },
      {
        "id": "api_developer",
        "name": "API Developer",
        "perspective": "Performance and simplicity for developers"
      }
    ]
  }
}
```

**Step 3**: Decision framework to choose solution
```json
{
  "tool": "decision_framework",
  "arguments": {
    "decisionStatement": "Choose JWT revocation strategy",
    "options": [
      {"name": "Blacklist", "description": "Maintain list of revoked tokens"},
      {"name": "Short expiry", "description": "Very short token lifetime with refresh"},
      {"name": "Hybrid", "description": "Short-lived access + longer refresh tokens"}
    ],
    "criteria": [
      {"name": "Security", "weight": 0.4},
      {"name": "Performance", "weight": 0.3},
      {"name": "Implementation complexity", "weight": 0.3}
    ]
  }
}
```

## Common Patterns and Best Practices

### 1. Start Simple, Add Complexity

Begin with basic tool usage and gradually add more sophisticated parameters:

```json
// Simple start
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Plan database migration",
    "thoughtNumber": 1,
    "totalThoughts": 3
  }
}

// Add complexity as needed
{
  "tool": "sequential_thinking",
  "arguments": {
    "thought": "Plan database migration with zero downtime",
    "thoughtNumber": 1,
    "totalThoughts": 5,
    "currentStep": {
      "stepDescription": "Analyze current schema and identify breaking changes",
      "expectedOutcome": "List of schema changes and compatibility requirements",
      "nextStepConditions": ["Schema analysis complete", "Breaking changes identified"]
    }
  }
}
```

### 2. Use Tool Combinations Effectively

- **Planning**: sequential_thinking → problem_decomposition
- **Analysis**: critical_thinking → collaborative_reasoning → decision_framework
- **Design**: domain_modeling → visual_reasoning → temporal_thinking
- **Debugging**: debugging_approach → scientific_method (for hypothesis testing)

### 3. Iterate and Refine

Most tools support iteration. Use this for complex problems:

```json
{
  "tool": "mental_model",
  "arguments": {
    "modelName": "First Principles",
    "problem": "Optimize API performance",
    "iteration": 2,
    "previousConclusions": ["Database queries are the bottleneck"],
    "refinedSteps": [
      "Break down database performance into: query complexity, indexing, connection pooling",
      "Question assumption: Are we measuring the right metrics?",
      "Build solution: Start with query optimization before infrastructure changes"
    ]
  }
}
```

### 4. Leverage Context and State

Some tools maintain context across invocations:

```json
// First call establishes context
{
  "tool": "collaborative_reasoning",
  "arguments": {
    "topic": "API versioning strategy",
    "sessionId": "api-versioning-2024",
    "stage": "initial_discussion"
  }
}

// Later calls reference the same session
{
  "tool": "collaborative_reasoning",
  "arguments": {
    "sessionId": "api-versioning-2024",
    "stage": "synthesis",
    "activePersonaId": "architect",
    "iteration": 3
  }
}
```

## Integration Tips

### With IDEs and Editors

Most MCP-compatible clients will present tools in a searchable interface. Use descriptive names in your requests:

```json
{
  "tool": "debugging_approach", 
  "arguments": {
    // Clear, specific problem description
    "issue": "React component re-renders excessively on prop changes",
    // Helpful classification
    "classification": {
      "category": "performance",
      "severity": "medium",
      "impact": "user-experience"
    }
  }
}
```

### Error Handling

Tools validate inputs and provide helpful error messages. Common issues:

- Missing required fields
- Invalid enum values  
- Malformed nested objects

Always check the tool's schema if you encounter validation errors.

### Performance Considerations

- Most tools execute quickly (<100ms)
- Tools with state (like sequential_thinking) may take longer on first use
- Complex visualizations (visual_reasoning, temporal_thinking) may take more time

---

*For more examples and advanced usage patterns, see the [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) documentation.*