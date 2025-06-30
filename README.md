# Thinking Patterns MCP Server

[![smithery badge](https://smithery.ai/badge/@emmahyde/thinking-patterns)](https://smithery.ai/server/@emmahyde/thinking-patterns)
[![NPM Version](https://img.shields.io/npm/v/%40emmahyde%2Fthinking-patterns)](https://www.npmjs.com/package/@emmahyde/thinking-patterns)

A comprehensive Model Context Protocol (MCP) server that combines systematic thinking, mental models, debugging approaches, and stochastic algorithms for enhanced problem-solving capabilities. This server merges the functionality of Clear Thought and Stochastic Thinking servers into a unified cognitive toolkit.

## Features

### Available Tools

1. **sequential_thinking** - Dynamic multi-step thinking with revision support
1. **mental_model** - Structured mental models for problem-solving
1. **debugging_approach** - Systematic debugging methodologies
1. **collaborative_reasoning** - Multi-perspective collaborative problem solving
1. **decision_framework** - Structured decision analysis and rational choice
1. **metacognitive_monitoring** - Self-assessment of knowledge and reasoning quality
1. **scientific_method** - Formal hypothesis testing and experimentation
1. **structured_argumentation** - Dialectical reasoning and argument analysis
1. **visual_reasoning** - Diagram-based thinking and problem solving
1. **domain_modeling** - Creating and refining conceptual models of a domain
1. **problem_decomposition** - Breaking down complex problems into manageable sub-problems
1. **critical_thinking** - Systematic evaluation of arguments, assumptions, and potential issues
1. **recursive_thinking** - Applying recursive strategies to solve problems with base and recursive cases
1. **temporal_thinking** - Modeling systems and reasoning across time using states, events, and transitions in both text and diagrams
1. **stochastic_algorithm** - Probabilistic algorithms for decision-making under uncertainty
  - **Markov Decision Processes**: Sequential decision-making with clear state transitions and defined rewards.
  - **Monte Carlo Tree Search**: Game playing, strategic planning, large decision spaces where simulation is possible.
  - **Multi-Armed Bandit**: A/B testing, resource allocation, online advertising, quick adaptation needs.
  - **Bayesian Optimization**: Hyperparameter tuning, expensive function optimization, continuous parameter spaces.
  - **Hidden Markov Models**: Time series analysis, pattern recognition, state inference, sequential data modeling.

## Recommended
- `sequential-thinking` & `problem-decomposition` are classic choices for planning.
- `debugging-approach` for runtime investigations; try sending it an error message from a test run.
- `collaborative-reasoning` often reveals issues or anti-patterns by simulating multiple roles who all must arrive at a consensus.
- `temporal-thinking` automatically generates **Mermaid sequence diagrams** from state transitions - perfect for visualizing user flows, API interactions, and system processes.

## Installation

### Installing via Smithery

To install Thinking Patterns MCP Server for Cursor automatically via [Smithery](https://smithery.ai/server/@emmahyde/thinking-patterns):

```bash
npx -y @smithery/cli install @emmahyde/thinking-patterns --client cursor
```

### Manual Installation
```bash
npm install @emmahyde/thinking-patterns
```

Or run with npx:

```bash
npx -y @emmahyde/thinking-patterns
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

### MCP config
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
<img width="1100" alt="Screenshot 2025-05-29 at 08 41 05" src="https://github.com/user-attachments/assets/43d0c2b7-68fc-4e77-80b6-232d1d19a77c" />


## Real-World Usage Examples

### 1. Sequential Thinking - Product Strategy Planning
```typescript
// Breaking down a complex product launch strategy
const response = await mcp.callTool("sequential_thinking", {
  thought: "We need to analyze our competitive position before launching the new AI feature. Current market has 3 major players with 60% market share combined. Our differentiator is real-time processing speed.",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,
  currentStep: {
    stepDescription: "Conduct competitive analysis and identify market gaps",
    recommendedTools: [
      {
        toolName: "market_research",
        confidence: 0.9,
        rationale: "Need comprehensive competitor feature comparison",
        priority: 1
      }
    ],
    expectedOutcome: "Clear understanding of competitive landscape and positioning opportunities",
    nextStepConditions: ["Market research completed", "Key differentiators identified"]
  }
});
```

### 2. Mental Model - Business Problem Solving
```typescript
// Using First Principles thinking for cost optimization
const response = await mcp.callTool("mental_model", {
  modelName: "First Principles",
  problem: "Our cloud infrastructure costs have tripled in 6 months, from $10K to $30K monthly, while user growth was only 50%. Need to identify root causes and optimize.",
  steps: [
    "Break down costs by service: compute (60%), storage (25%), networking (15%)",
    "Analyze cost per user metrics: went from $2.50 to $5.00 per active user",
    "Identify inefficiencies: unused reserved instances, over-provisioned databases",
    "Calculate impact of optimization strategies: right-sizing could save 40%"
  ],
  reasoning: "First principles thinking helps us question each cost component rather than accepting the current architecture as given. By breaking down to fundamental elements, we can rebuild more efficiently.",
  conclusion: "Implement auto-scaling, consolidate databases, and switch to spot instances for development environments. Projected savings: $12K/month (40% reduction)."
});
```

### 3. Debugging Approach - Production System Failure
```typescript
// Systematic debugging of a critical production issue
const response = await mcp.callTool("debugging_approach", {
  approachName: "Root Cause Analysis",
  issue: "E-commerce checkout system experiencing 15% failure rate during peak hours (6-8 PM). Payment processing succeeds but order confirmation emails fail, causing customer confusion and support tickets.",
  classification: {
    category: "reliability",
    severity: "high",
    priority: "urgent",
    impact: "system-wide",
    frequency: "often"
  },
  steps: [
    "Monitor email service logs during peak hours",
    "Check rate limiting and queuing mechanisms",
    "Analyze correlation between payment volume and email failures",
    "Review recent deployments and configuration changes"
  ],
  hypotheses: [
    {
      statement: "Email service rate limits are being exceeded during peak traffic",
      confidence: 0.8,
      status: "testing",
      testPlan: "Monitor email API calls vs. rate limits during 6-8 PM window"
    }
  ],
  findings: "Email service has 1000 requests/minute limit. During peak hours, we're hitting 1200+ requests/minute, causing 15% to be dropped.",
  resolution: "Implemented exponential backoff retry mechanism and increased email service tier to 2000 requests/minute. Failure rate reduced to <1%."
});
```

### 4. Stochastic Algorithm - A/B Testing Optimization
```typescript
// Multi-armed bandit for dynamic A/B testing
const response = await mcp.callTool("stochastic_algorithm", {
  algorithm: "Multi-Armed Bandit",
  problem: "Optimize homepage hero section to maximize sign-up conversions. Have 4 variants: Original (2.1% conversion), Video Demo (2.8%), Customer Testimonials (2.5%), Product Features (2.3%). Need to dynamically allocate traffic to best performers.",
  parameters: {
    "epsilon": "0.1",
    "variants": "4",
    "exploration_rate": "10%",
    "confidence_level": "95%"
  },
  result: "After 2 weeks with 50K visitors: Video Demo variant achieved 3.1% conversion rate with 95% confidence. Recommended allocation: Video Demo (70%), Customer Testimonials (20%), exploration (10%). Projected lift: +47% conversions."
});
```

### 5. Collaborative Reasoning - Technical Architecture Decision
```typescript
// Multi-stakeholder technical decision making
const response = await mcp.callTool("collaborative_reasoning", {
  topic: "Choose database architecture for new social media analytics platform expecting 10M+ users",
  personas: [
    {
      id: "cto",
      name: "CTO",
      expertise: ["system architecture", "scalability", "cost optimization"],
      background: "Led scaling at 3 previous startups",
      perspective: "Long-term technical sustainability and team productivity",
      biases: ["over-engineering", "perfectionism"],
      communication: { style: "strategic", tone: "measured" }
    },
    {
      id: "senior_dev",
      name: "Senior Developer",
      expertise: ["database performance", "query optimization", "development velocity"],
      background: "8 years building high-traffic applications",
      perspective: "Developer experience and maintainability",
      biases: ["status quo bias", "familiar technology preference"],
      communication: { style: "practical", tone: "direct" }
    }
  ],
  contributions: [
    {
      personaId: "cto",
      content: "We need to consider write-heavy workloads with 1M+ posts/day and complex analytics queries. PostgreSQL with read replicas vs. MongoDB with sharding vs. hybrid approach with PostgreSQL + ClickHouse.",
      type: "observation",
      confidence: 0.9
    },
    {
      personaId: "senior_dev",
      content: "Team has strong PostgreSQL expertise. MongoDB would require 3-6 months ramp-up. ClickHouse adds operational complexity but analytics performance is 10x better.",
      type: "concern",
      confidence: 0.8
    }
  ],
  stage: "critique",
  activePersonaId: "cto",
  sessionId: "db-decision-2024",
  iteration: 2,
  nextContributionNeeded: true
});
```

### 6. Decision Framework - Vendor Selection
```typescript
// Structured decision analysis for choosing a payment processor
const response = await mcp.callTool("decision_framework", {
  decisionStatement: "Select payment processor for international e-commerce platform processing $2M annually across 25 countries",
  options: [
    { name: "Stripe", description: "Developer-friendly with excellent APIs" },
    { name: "PayPal", description: "Widely recognized brand with buyer protection" },
    { name: "Adyen", description: "Enterprise-focused with local payment methods" }
  ],
  analysisType: "multi-criteria",
  criteria: [
    {
      name: "Transaction Fees",
      description: "Cost per transaction including international fees",
      weight: 0.3,
      evaluationMethod: "quantitative"
    },
    {
      name: "Global Coverage",
      description: "Number of countries and local payment methods supported",
      weight: 0.25,
      evaluationMethod: "quantitative"
    },
    {
      name: "Developer Experience",
      description: "API quality, documentation, integration ease",
      weight: 0.25,
      evaluationMethod: "qualitative"
    },
    {
      name: "Reliability",
      description: "Uptime, fraud protection, dispute resolution",
      weight: 0.2,
      evaluationMethod: "qualitative"
    }
  ],
  stage: "evaluation",
  decisionId: "payment-processor-2024",
  iteration: 1,
  nextStageNeeded: true
});
```

### 7. Metacognitive Monitoring - Code Review Quality
```typescript
// Self-assessment during critical system review
const response = await mcp.callTool("metacognitive_monitoring", {
  task: "Review authentication system changes before production deployment. New OAuth2 implementation affects 100K+ users.",
  stage: "execution",
  overallConfidence: 0.7,
  knowledgeAssessment: {
    domain: "OAuth2 Security Implementation",
    knowledgeLevel: "proficient",
    confidenceScore: 0.8,
    supportingEvidence: "Successfully implemented OAuth2 in 3 previous projects, familiar with security best practices",
    knownLimitations: ["Limited experience with this specific OAuth provider's edge cases", "Haven't tested token refresh under high load"]
  },
  claims: [
    {
      claim: "The implementation follows OAuth2 security best practices",
      status: "fact",
      confidenceScore: 0.9,
      evidenceBasis: "Code follows OWASP guidelines, uses secure token storage, implements proper scope validation"
    },
    {
      claim: "Token refresh mechanism will handle concurrent requests correctly",
      status: "uncertain",
      confidenceScore: 0.6,
      evidenceBasis: "Implemented locking mechanism but haven't load tested this specific scenario"
    }
  ],
  uncertaintyAreas: ["Edge case handling under high concurrent load", "Provider-specific token refresh behavior"],
  recommendedApproach: "Conduct focused load testing on token refresh mechanism and review provider documentation for edge cases before deployment",
  monitoringId: "auth-review-2024",
  iteration: 1,
  nextAssessmentNeeded: true
});
```

### 8. Scientific Method - Feature Impact Hypothesis
```typescript
// Testing hypothesis about user engagement feature
const response = await mcp.callTool("scientific_method", {
  stage: "experiment",
  observation: "User session duration has plateaued at 4.2 minutes average, while industry benchmark is 6.8 minutes",
  question: "How can we increase user engagement and session duration?",
  hypothesis: {
    statement: "Adding personalized content recommendations will increase average session duration by at least 25%",
    variables: [
      {
        name: "personalized_recommendations",
        type: "independent",
        operationalization: "ML-powered content suggestions based on user behavior and preferences"
      },
      {
        name: "session_duration",
        type: "dependent",
        operationalization: "Time from login to logout, measured in minutes"
      }
    ],
    assumptions: ["Users want personalized content", "Recommendation algorithm is accurate", "Page load times remain constant"],
    hypothesisId: "engagement-2024-q1",
    confidence: 0.75,
    domain: "User Experience",
    iteration: 1,
    status: "testing"
  },
  experiment: {
    design: "A/B Test",
    methodology: "50/50 split test over 4 weeks with 10K users per group",
    predictions: [
      {
        if: "Users see personalized recommendations on homepage and content pages",
        then: "Average session duration will increase from 4.2 to 5.25+ minutes (25% improvement)",
        else: "Session duration will remain at baseline 4.2 minutes"
      }
    ],
    controlMeasures: ["Same user demographics in both groups", "Identical page load times", "No other feature changes during test period"],
    experimentId: "engagement-ab-test-2024",
    hypothesisId: "engagement-2024-q1"
  },
  inquiryId: "user-engagement-study",
  iteration: 1,
  nextStageNeeded: true
});
```

### 9. Structured Argumentation - Technical Debt Decision
```typescript
// Arguing for technical debt prioritization
const response = await mcp.callTool("structured_argumentation", {
  claim: "We should prioritize refactoring the user authentication system over building new features this quarter",
  premises: [
    "Current auth system has 23% of all production bugs",
    "Security vulnerabilities increase customer churn by 15%",
    "Authentication refactor will reduce future development velocity by 40%",
    "New features are projected to bring in $500K ARR",
    "Security incidents cost average $2.3M per breach"
  ],
  conclusion: "Despite short-term revenue impact, authentication refactor is critical for long-term business sustainability and customer trust",
  argumentType: "thesis",
  confidence: 0.85,
  strengths: [
    "Quantified business impact of security issues",
    "Clear correlation between auth bugs and customer issues",
    "Risk mitigation approach aligns with enterprise customer requirements"
  ],
  weaknesses: [
    "Revenue impact is immediate while security benefits are potential",
    "Assumes auth refactor will eliminate all security issues",
    "Doesn't consider partial refactor options"
  ],
  nextArgumentNeeded: false
});
```

### 10. Visual Reasoning - System Architecture Optimization
```typescript
// Analyzing and optimizing microservices architecture
const response = await mcp.callTool("visual_reasoning", {
  operation: "analyze",
  diagramId: "microservices-architecture-2024",
  diagramType: "network-diagram",
  purpose: "Optimize microservices communication patterns to reduce latency and improve reliability",
  elements: [
    {
      id: "user-service",
      type: "node",
      label: "User Service",
      properties: {
        position: { x: 100, y: 100 },
        style: { color: "blue", size: "large" },
        semantics: { category: "core-service", importance: "critical" }
      },
      connectedTo: ["auth-service", "profile-service", "notification-service"]
    },
    {
      id: "auth-service",
      type: "node",
      label: "Auth Service",
      properties: {
        position: { x: 300, y: 100 },
        style: { color: "red", size: "medium" },
        semantics: { category: "security", importance: "critical" }
      },
      connectedTo: ["user-service", "api-gateway"]
    },
    {
      id: "high-latency-connection",
      type: "edge",
      source: "user-service",
      target: "notification-service",
      properties: {
        style: { color: "red", size: "medium" },
        metadata: { latency: "450ms", frequency: "high" }
      }
    }
  ],
  observation: "User service has synchronous calls to notification service causing 450ms latency for user profile updates",
  insight: "Converting user->notification communication to async messaging could reduce user-facing latency by 80%",
  transformationType: "restructure",
  transformationDetails: {
    target: ["high-latency-connection"],
    rationale: "Replace synchronous HTTP calls with asynchronous message queue to decouple services",
    parameters: { "pattern": "event-driven", "queue": "Redis Streams" }
  },
  iteration: 1,
  nextOperationNeeded: true
});
```

### 11. Domain Modeling - E-commerce Platform
```typescript
// Modeling order management domain for complex e-commerce
const response = await mcp.callTool("domain_modeling", {
  domainName: "Order Management",
  description: "Complex e-commerce order processing supporting multiple payment methods, international shipping, inventory management, and return handling",
  entities: [
    {
      name: "Order",
      description: "Customer purchase containing multiple items with payment and shipping details",
      attributes: ["orderId", "customerId", "orderDate", "status", "totalAmount", "currency", "shippingAddress"],
      behaviors: ["calculateTotal", "validateInventory", "processPayment", "generateInvoice"],
      constraints: ["Total amount must be positive", "Customer must exist", "All items must be available"]
    },
    {
      name: "OrderItem",
      description: "Individual product within an order with quantity and pricing",
      attributes: ["itemId", "productId", "quantity", "unitPrice", "discount"],
      behaviors: ["calculateSubtotal", "validateStock"],
      constraints: ["Quantity must be positive", "Unit price must be positive"]
    }
  ],
  relationships: [
    {
      name: "contains",
      type: "one-to-many",
      sourceEntity: "Order",
      targetEntity: "OrderItem",
      description: "An order contains one or more order items",
      cardinality: "1..*"
    }
  ],
  domainRules: [
    {
      name: "Inventory Reservation",
      description: "When order is placed, inventory must be reserved until payment confirmation",
      type: "business-rule",
      entities: ["Order", "OrderItem"],
      condition: "Order status changes to 'placed'",
      consequence: "Reserve inventory for all order items for 15 minutes"
    }
  ],
  stage: "logical",
  abstractionLevel: "medium",
  paradigm: "domain-driven",
  modelingId: "ecommerce-order-mgmt",
  iteration: 1,
  nextStageNeeded: true
});
```

### 12. Problem Decomposition - Mobile App Development
```typescript
// Breaking down complex mobile app development project
const response = await mcp.callTool("problem_decomposition", {
  problem: "Develop cross-platform mobile app for fitness tracking with social features, targeting 100K users in 6 months. Must include workout tracking, social sharing, progress analytics, and premium subscriptions.",
  decomposition: [
    {
      id: "mvp-core",
      description: "MVP with basic workout tracking and user authentication",
      category: "development",
      complexity: "high",
      priority: "critical",
      effortEstimate: "8 weeks",
      dependencies: [],
      acceptanceCriteria: [
        {
          description: "Users can create accounts and log in securely",
          measurable: true,
          priority: "must-have",
          testable: true
        },
        {
          description: "Users can track basic workouts (time, type, calories)",
          measurable: true,
          priority: "must-have",
          testable: true
        }
      ],
      risks: [
        {
          description: "Cross-platform performance issues",
          probability: 0.3,
          impact: "medium",
          category: "technical",
          mitigation: "Prototype testing on both iOS and Android early"
        }
      ]
    },
    {
      id: "social-features",
      description: "Social sharing, friend connections, and activity feeds",
      category: "feature-development",
      complexity: "medium",
      priority: "high",
      effortEstimate: "4 weeks",
      dependencies: ["mvp-core"],
      acceptanceCriteria: [
        {
          description: "Users can share workout achievements on social platforms",
          measurable: true,
          priority: "must-have",
          testable: true
        }
      ]
    },
    {
      id: "premium-subscriptions",
      description: "Payment processing and premium feature access",
      category: "monetization",
      complexity: "high",
      priority: "high",
      effortEstimate: "3 weeks",
      dependencies: ["mvp-core"],
      stakeholders: [
        {
          name: "Product Manager",
          role: "owner",
          influence: "high",
          interest: "high"
        },
        {
          name: "Legal Team",
          role: "reviewer",
          influence: "medium",
          interest: "high"
        }
      ]
    }
  ],
  methodology: "Feature-driven Development",
  objectives: ["Launch MVP in 12 weeks", "Achieve 10K downloads in first month", "Establish premium conversion pipeline"]
});
```

### 13. Critical Thinking - Investment Decision Analysis
```typescript
// Critical analysis of a startup acquisition opportunity
const response = await mcp.callTool("critical_thinking", {
  subject: "Proposed acquisition of AI startup for $15M. Target: 50-person company with patent portfolio and $2M ARR",
  potentialIssues: [
    {
      description: "Patent portfolio may have prior art challenges not discovered in initial review",
      severity: "high",
      category: "legal",
      likelihood: 0.25,
      mitigation: "Conduct comprehensive patent landscape analysis with IP law firm"
    },
    {
      description: "Key technical talent may leave post-acquisition, reducing core value proposition",
      severity: "critical",
      category: "technical",
      likelihood: 0.4,
      mitigation: "Structure retention bonuses and equity for top 10 engineers"
    }
  ],
  edgeCases: [
    {
      scenario: "Competing acquisition offer emerges during due diligence",
      conditions: ["Bidding war scenario", "Target company shops the deal"],
      currentBehavior: "No competitive bidding strategy defined",
      expectedBehavior: "Pre-defined maximum bid threshold and walk-away criteria",
      testability: "moderate",
      businessImpact: "high"
    }
  ],
  invalidAssumptions: [
    {
      statement: "AI talent will be excited to join a larger, more bureaucratic organization",
      validity: "questionable",
      verification: "Survey similar acquisitions in our portfolio for retention rates",
      consequences: "If wrong, could lose 50%+ of technical team within 12 months"
    },
    {
      statement: "$2M ARR will scale linearly with our sales resources",
      validity: "invalid",
      verification: "Analyze product-market fit and sales cycle complexity",
      dependencies: ["Customer base analysis", "Sales process evaluation"]
    }
  ],
  alternativeApproaches: [
    {
      name: "Strategic Partnership",
      description: "Form joint venture instead of full acquisition",
      advantages: ["Lower financial risk", "Retain startup agility", "Test integration before full commitment"],
      disadvantages: ["Less control over roadmap", "Potential for partner conflicts"],
      complexity: "medium",
      feasibility: 0.8,
      timeToImplement: "3-6 months"
    },
    {
      name: "Acqui-hire Focus",
      description: "Target primarily talent acquisition with technology as secondary benefit",
      advantages: ["Clear success metrics", "Lower valuation risk", "Faster integration"],
      disadvantages: ["May miss breakthrough technology value", "Patent portfolio underutilized"],
      complexity: "low",
      feasibility: 0.9,
      timeToImplement: "2-4 months"
    }
  ],
  analysisDepth: "comprehensive",
  confidenceLevel: 0.75,
  analysisId: "acquisition-analysis-2024"
});
```

### 14. Recursive Thinking - Algorithm Optimization
```typescript
// Recursive approach to optimizing a recommendation algorithm
const response = await mcp.callTool("recursive_thinking", {
  problem: "Optimize collaborative filtering recommendation system that currently takes 45 seconds to generate recommendations for 1M users. Target: sub-5 second response time.",
  baseCases: [
    {
      condition: "User has < 10 interactions",
      solution: "Use popularity-based recommendations from precomputed cache",
      complexity: "O(1)"
    },
    {
      condition: "Processing < 1000 users",
      solution: "Use standard matrix factorization without optimization",
      complexity: "O(n²)"
    }
  ],
  recursiveCases: [
    {
      condition: "Large user base (>1000 users)",
      decomposition: "Divide users into cohorts based on behavior patterns, process each cohort separately",
      recombination: "Merge cohort recommendations using weighted scoring based on user similarity",
      reductionFactor: "Split into roughly equal cohorts of ~1000 users each"
    },
    {
      condition: "High-dimensional item space (>10K items)",
      decomposition: "Apply hierarchical clustering to group similar items, process item clusters recursively",
      recombination: "Aggregate cluster recommendations and re-rank based on user preferences"
    }
  ],
  terminationConditions: [
    "Cohort size reaches base case threshold (<1000 users)",
    "Item cluster size manageable for direct computation",
    "Response time target achieved (5 seconds)",
    "Recommendation quality threshold maintained (>85% user satisfaction)"
  ],
  optimizations: [
    {
      technique: "memoization",
      description: "Cache intermediate similarity calculations between user cohorts",
      implementation: "Redis-based cache with 1-hour TTL for cohort similarity matrices",
      complexityImprovement: "Reduces repeated computation from O(n²) to O(1) for cached pairs",
      tradeoffs: ["Increased memory usage", "Cache invalidation complexity"]
    },
    {
      technique: "parallel processing",
      description: "Process user cohorts in parallel using worker threads",
      implementation: "Map-reduce pattern with cohort-level parallelization",
      complexityImprovement: "Near-linear speedup with number of available cores"
    }
  ],
  complexityAnalysis: {
    timeComplexity: "O(n log n) with cohort division vs O(n²) baseline",
    spaceComplexity: "O(n) for cohort storage plus O(k) for cache where k is number of cached similarities",
    maxStackDepth: "O(log n) recursion depth for cohort subdivision"
  },
  domain: "Machine Learning Systems",
  problemId: "recommendation-optimization-2024"
});
```

### 15. Temporal Thinking - User Journey Optimization
```typescript
// Modeling user onboarding flow over time to identify drop-off points
const response = await mcp.callTool("temporal_thinking", {
  context: "SaaS application user onboarding process with 65% drop-off rate between signup and first successful action. Need to model user journey to identify intervention points.",
  initialState: "anonymous_visitor",
  states: [
    {
      name: "anonymous_visitor",
      description: "User browsing marketing site, not yet registered",
      properties: {
        duration: { typical: "3 minutes", max: "30 minutes" },
        isStable: false,
        priority: "medium"
      },
      entryActions: ["Track page views", "Show value proposition"],
      invariants: ["User has not provided email", "No authentication cookie present"]
    },
    {
      name: "trial_signup",
      description: "User has provided email and created account",
      properties: {
        duration: { min: "30 seconds", typical: "2 minutes", max: "10 minutes" },
        isStable: false,
        priority: "critical"
      },
      entryActions: ["Send welcome email", "Initialize user workspace", "Track signup conversion"],
      exitActions: ["Record time to first action"]
    },
    {
      name: "onboarding_tutorial",
      description: "User going through guided product tutorial",
      properties: {
        duration: { typical: "8 minutes", max: "20 minutes" },
        isStable: false,
        priority: "high"
      },
      entryActions: ["Start tutorial tracking", "Show progress indicator"],
      invariants: ["Tutorial completion rate tracked", "Help tooltips available"]
    },
    {
      name: "first_value_achieved",
      description: "User has completed their first meaningful action",
      properties: {
        duration: { min: "1 day" },
        isStable: true,
        priority: "critical"
      },
      entryActions: ["Send congratulations email", "Unlock advanced features"],
      invariants: ["At least one core action completed"]
    },
    {
      name: "churned",
      description: "User abandoned the onboarding process",
      properties: {
        isFinal: true,
        priority: "low"
      },
      entryActions: ["Send re-engagement email series", "Track churn reason"]
    }
  ],
  events: [
    {
      name: "signup_completed",
      description: "User successfully creates account with valid email",
      properties: { type: "external", predictability: "stochastic" },
      triggers: ["Form submission", "Social login"]
    },
    {
      name: "tutorial_abandoned",
      description: "User leaves tutorial without completing",
      properties: { type: "condition", predictability: "stochastic" },
      preconditions: ["In tutorial for >2 minutes", "No progress in last 30 seconds"]
    },
    {
      name: "value_action_completed",
      description: "User completes core product action (create project, invite team, etc.)",
      properties: { type: "internal", predictability: "deterministic" }
    }
  ],
  transitions: [
    {
      from: "anonymous_visitor",
      to: "trial_signup",
      event: "signup_completed",
      properties: { probability: 0.12 },
      action: "Initialize user onboarding flow"
    },
    {
      from: "trial_signup",
      to: "onboarding_tutorial",
      event: "tutorial_started",
      properties: { probability: 0.85 },
      guard: "Account activation completed"
    },
    {
      from: "onboarding_tutorial",
      to: "churned",
      event: "tutorial_abandoned",
      properties: { probability: 0.45 },
      action: "Track abandonment point and trigger re-engagement"
    },
    {
      from: "onboarding_tutorial",
      to: "first_value_achieved",
      event: "value_action_completed",
      properties: { probability: 0.55 },
      action: "Celebrate success and suggest next steps"
    }
  ],
  timeConstraints: [
    {
      description: "Users who don't achieve first value within 7 days have 90% churn probability",
      type: "deadline",
      value: "7 days"
    },
    {
      description: "Tutorial should complete within 10 minutes for optimal engagement",
      type: "duration",
      value: "10 minutes"
    }
  ],
  analysis: {
    criticalPaths: [
      {
        path: ["anonymous_visitor", "trial_signup", "onboarding_tutorial", "first_value_achieved"],
        probability: 0.056,
        duration: "30 minutes average"
      }
    ],
    bottlenecks: [
      {
        state: "onboarding_tutorial",
        reason: "45% abandonment rate during tutorial phase",
        impact: "high"
      }
    ]
  },
  modelId: "user-onboarding-2024",
  domain: "User Experience",
  purpose: "Identify optimization opportunities in user onboarding to reduce churn from 65% to <30%"
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE for details.

## Acknowledgments

- Based on [the thinking-patterns server](https://github.com/waldzellai/waldzell-mcp), which is based on the Model Context Protocol (MCP) by Anthropic
- Combines functionality from Clear Thought and Stochastic Thinking MCP servers
- Mental Models framework inspired by [James Clear's comprehensive guide to mental models](https://jamesclear.com/mental-models)
- Stochastic algorithms based on classic works in reinforcement learning and decision theory
