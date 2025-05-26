# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides cognitive tools for AI systems. It combines systematic thinking, mental models, debugging approaches, and stochastic algorithms for comprehensive problem-solving support.

## Common Development Commands

**Build and Development:**
- `npm run build` - Compile TypeScript to dist/ directory 
- `npm run watch` - Watch for changes and recompile
- `npm run clean` - Remove dist/ directory
- `npm start` - Run the compiled server
- `npm run dev` - Start development with watch mode

**Quality Assurance:**
- `npm test` - Run tests (currently placeholder)
- `npm run lint` - Run linting (currently placeholder)

**Deployment:**
- `npm run docker` - Build Docker image
- `npm run deploy` - Deploy via Smithery

## Architecture Overview

### Core Structure
This is a monolithic MCP server in `index.ts` (1,620 lines) that implements 10 cognitive tools:

1. **sequentialthinking** - Multi-step thinking with revision support
2. **mentalmodel** - Structured mental models (first principles, opportunity cost, etc.)
3. **debuggingapproach** - Systematic debugging methods (binary search, divide & conquer, etc.)
4. **stochasticalgorithm** - Probabilistic algorithms (MDP, MCTS, bandit, Bayesian, HMM)
5. **collaborativereasoning** - Multi-perspective problem solving
6. **decisionframework** - Structured decision analysis
7. **metacognitivemonitoring** - Self-assessment of reasoning quality
8. **scientificmethod** - Formal hypothesis testing
9. **structuredargumentation** - Dialectical reasoning
10. **visualreasoning** - Diagram-based thinking

### Key Components

**Server Classes:** Each tool has a dedicated server class that handles validation, processing, and formatting. The older servers (MentalModel, Debugging, SequentialThinking, Stochastic) use manual validation, while newer servers use unsafe type assertions.

**State Management:** SequentialThinkingServer maintains state in memory via `thoughtHistory` and `branches` arrays. A SessionManager exists in `src/services/SessionManager.ts` for proper session isolation.

**Data Interfaces:** Complex TypeScript interfaces define the data structures for each cognitive tool, with detailed schemas for collaborative reasoning, decision frameworks, etc.

**Tool Definitions:** Each tool has a detailed schema defining its parameters and validation rules.

### Critical Architecture Issues

⚠️ **State Management Memory Leak:** SequentialThinkingServer stores state in private arrays that persist across all sessions, causing memory leaks and data bleeding between users.

⚠️ **Inconsistent Validation:** Newer server classes use unsafe `input as Type` assertions instead of proper validation.

⚠️ **Security Vulnerabilities:** Some schemas allow `additionalProperties: true` and lack input sanitization.

### Recent Additions

The `src/` directory contains:
- `services/SessionManager.ts` - Session isolation implementation
- `errors/CustomErrors.ts` - Structured error classes

## Development Guidelines

### When Adding New Cognitive Tools
1. Define TypeScript interfaces for input/output data
2. Create a server class extending the pattern in existing servers
3. Add tool definition with proper schema validation
4. Register in the main server's tool list and request handlers
5. Consider session state requirements carefully

### Critical Areas Requiring Attention
1. **Fix SequentialThinkingServer state management** - Replace private arrays with SessionManager
2. **Replace unsafe type assertions** - Use proper validation in newer server classes
3. **Security hardening** - Remove `additionalProperties: true` and add input sanitization
4. **Modularization** - Break up the monolithic index.ts file

### Testing Approach
- No formal testing framework currently configured
- Manual testing via MCP client interactions
- Need to implement comprehensive test suite covering all 10 tools

## Deployment Context

- Builds to `dist/index.js` executable
- Deployed via Smithery platform
- Docker image: `waldzellai/thinking-patterns`  
- NPM package: `@emmahyde/thought-patterns`
- Runs on Node.js 18+ via stdio transport

## Dependencies

Key dependencies:
- `@modelcontextprotocol/sdk` - MCP framework
- `chalk` - Console output formatting  
- `yargs` - CLI argument parsing
- `zod` - Schema validation (installed but not fully utilized)

Development dependencies focus on TypeScript compilation and type definitions.