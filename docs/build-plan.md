# Thinking Patterns Project: Build Plan & Implementation Guide

## Project Analysis Summary

The thinking-patterns project is an MCP (Model Context Protocol) server providing cognitive tools for AI models. While conceptually solid, it has critical architectural flaws that need systematic addressing.

### Critical Issues Identified:
- State management memory leaks in SequentialThinkingServer
- Inconsistent validation patterns between old and new servers
- Security vulnerabilities from unsafe input handling
- Monolithic 1,620-line file structure
- Missing quality assurance infrastructure

## Implementation Plan: 4 Phases

---

## PHASE 1: CRITICAL SECURITY & STABILITY FIXES
**Priority: Immediate | Timeline: 1-3 days**

### Task 1.1: Fix State Management Crisis

<instruction>
Analyze the SequentialThinkingServer class in index.ts and identify all persistent state variables (thoughtHistory, branches arrays)
</instruction>

<instruction>
Create a new file src/services/SessionManager.ts that implements proper session isolation with the following interface:
```typescript
interface SessionManager {
  createSession(sessionId: string): void;
  getSession(sessionId: string): SessionData | null;
  clearSession(sessionId: string): void;
  cleanupExpiredSessions(): void;
}
```
</instruction>

<instruction>
Modify SequentialThinkingServer to be stateless by:
1. Removing the private thoughtHistory and branches arrays
2. Adding sessionId parameter to processThought method
3. Using SessionManager to store/retrieve session-specific state
4. Adding automatic session cleanup after 1 hour of inactivity
</instruction>

<instruction>
Add request context middleware to ensure each tool call includes a sessionId or generates one automatically
</instruction>

### Task 1.2: Implement Centralized Validation

<instruction>
Install Zod validation library: `npm install zod`
</instruction>

<instruction>
Create src/validation/schemas.ts containing Zod schemas for all data interfaces:
- ThoughtData schema with proper type validation
- MentalModelData schema
- All other interface schemas (CollaborativeReasoningData, DecisionFrameworkData, etc.)
</instruction>

<instruction>
Create src/validation/BaseValidator.ts with a common validation pattern:
```typescript
export class BaseValidator<T> {
  constructor(private schema: z.ZodSchema<T>) {}

  validate(input: unknown): T {
    const result = this.schema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }
    return result.data;
  }
}
```
</instruction>

<instruction>
Replace all unsafe type assertions (`input as Type`) in these server classes:
- CollaborativeReasoningServer
- DecisionFrameworkServer
- MetacognitiveMonitoringServer
- ScientificMethodServer
- StructuredArgumentationServer
- VisualReasoningServer

Use the new BaseValidator pattern instead
</instruction>

### Task 1.3: Security Hardening

<instruction>
Remove all `additionalProperties: true` from tool schemas in index.ts and replace with explicitly defined properties
</instruction>

<instruction>
Create src/security/InputSanitizer.ts that:
1. Limits string input lengths (max 10,000 characters)
2. Validates array sizes (max 100 items)
3. Prevents deeply nested objects (max 5 levels)
4. Strips potentially dangerous HTML/script content
</instruction>

<instruction>
Add input size validation to all server process methods before validation
</instruction>

<instruction>
Create custom error classes in src/errors/CustomErrors.ts:
- ValidationError
- StateError
- SecurityError
- ProcessingError
Each with error codes and structured messages
</instruction>

---

## PHASE 2: CODE QUALITY & ARCHITECTURE
**Priority: High | Timeline: 1-2 weeks**

### Task 2.1: Modularize Codebase

<instruction>
Create the following directory structure:
```
src/
├── interfaces/
├── servers/
├── tools/
├── utils/
├── validation/
├── services/
├── errors/
└── types/
```
</instruction>

<instruction>
Move all interface definitions from index.ts to separate files in src/interfaces/:
- src/interfaces/ThoughtData.ts
- src/interfaces/MentalModelData.ts
- src/interfaces/CollaborativeReasoningData.ts
- src/interfaces/DecisionFrameworkData.ts
- src/interfaces/MetacognitiveMonitoringData.ts
- src/interfaces/ScientificInquiryData.ts
- src/interfaces/ArgumentData.ts
- src/interfaces/VisualOperationData.ts
</instruction>

<instruction>
Create a base server class in src/servers/BaseServer.ts:
```typescript
export abstract class BaseServer<TInput, TOutput> {
  protected abstract validate(input: unknown): TInput;
  protected abstract process(validatedInput: TInput): TOutput;

  public execute(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validate(input);
      const result = this.process(validatedInput);
      return this.formatSuccess(result);
    } catch (error) {
      return this.formatError(error);
    }
  }

  protected abstract formatSuccess(result: TOutput): { content: Array<{ type: string; text: string }> };
  protected abstract formatError(error: unknown): { content: Array<{ type: string; text: string }>; isError: boolean };
}
```
</instruction>

<instruction>
Refactor each server class to extend BaseServer and move to separate files:
- src/servers/MentalModelServer.ts
- src/servers/DebuggingApproachServer.ts
- src/servers/SequentialThinkingServer.ts
- src/servers/StochasticServer.ts
- src/servers/CollaborativeReasoningServer.ts
- src/servers/DecisionFrameworkServer.ts
- src/servers/MetacognitiveMonitoringServer.ts
- src/servers/ScientificMethodServer.ts
- src/servers/StructuredArgumentationServer.ts
- src/servers/VisualReasoningServer.ts
</instruction>

<instruction>
Move tool definitions to src/tools/ directory:
- src/tools/MentalModelTool.ts
- src/tools/DebuggingApproachTool.ts
- src/tools/SequentialThinkingTool.ts
- And so on for each tool
</instruction>

<instruction>
Create src/utils/Formatter.ts to handle all console output formatting, removing formatting logic from server classes
</instruction>

<instruction>
Update index.ts to import and orchestrate all modules instead of containing implementation
</instruction>

### Task 2.2: Improve Error Handling

<instruction>
Implement structured error responses in src/errors/ErrorHandler.ts:
```typescript
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}
```
</instruction>

<instruction>
Add error logging to src/utils/Logger.ts using a proper logging framework (install winston: `npm install winston`)
</instruction>

<instruction>
Replace all console.error calls with proper logger.error calls
</instruction>

<instruction>
Add error boundaries around each tool execution with proper error categorization
</instruction>

### Task 2.3: Database/Persistence Layer (Optional)

<instruction>
If session persistence is needed, create src/persistence/SessionStore.ts with options for:
- In-memory storage (current behavior)
- Redis storage (for production)
- File-based storage (for development)
</instruction>

---

## PHASE 3: DEVELOPER EXPERIENCE
**Priority: Medium | Timeline: 2-4 weeks**

### Task 3.1: Testing Infrastructure

<instruction>
Install testing dependencies: `npm install --save-dev jest @types/jest ts-jest`
</instruction>

<instruction>
Create jest.config.js with TypeScript support:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};
```
</instruction>

<instruction>
Create comprehensive test suite in tests/ directory:
- tests/servers/ - Unit tests for each server class
- tests/validation/ - Tests for validation logic
- tests/integration/ - Integration tests for tool interactions
- tests/security/ - Security validation tests
</instruction>

<instruction>
Write unit tests for each server class testing:
- Valid input processing
- Invalid input handling
- Error scenarios
- State management (for SequentialThinkingServer)
</instruction>

<instruction>
Create integration tests that simulate real MCP tool calls
</instruction>

<instruction>
Update package.json test script to run jest with coverage: `"test": "jest --coverage"`
</instruction>

### Task 3.2: Code Quality Tools

<instruction>
Install ESLint and Prettier: `npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier`
</instruction>

<instruction>
Create .eslintrc.js with strict TypeScript rules:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};
```
</instruction>

<instruction>
Create .prettierrc.json with formatting rules:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```
</instruction>

<instruction>
Update package.json with lint and format scripts:
```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  }
}
```
</instruction>

<instruction>
Install husky for pre-commit hooks: `npm install --save-dev husky lint-staged`
</instruction>

<instruction>
Configure pre-commit hooks in package.json:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write", "git add"]
  }
}
```
</instruction>

### Task 3.3: Documentation

<instruction>
Add comprehensive JSDoc comments to all public APIs in server classes
</instruction>

<instruction>
Create docs/architecture.md explaining:
- Project structure
- Server responsibilities
- Data flow
- Extension points
</instruction>

<instruction>
Create docs/api.md with detailed API documentation for each tool
</instruction>

<instruction>
Update README.md with:
- Installation instructions
- Development setup
- Testing guidelines
- Contributing guidelines
</instruction>

<instruction>
Create examples/ directory with practical usage examples for each cognitive tool
</instruction>

---

## PHASE 4: PERFORMANCE & SCALABILITY
**Priority: Low | Timeline: 1 month**

### Task 4.1: Logging and Monitoring

<instruction>
Replace all console.error usage with structured logging using Winston
</instruction>

<instruction>
Create src/monitoring/MetricsCollector.ts to track:
- Tool usage frequency
- Processing times
- Error rates
- Memory usage
</instruction>

<instruction>
Add request tracing with correlation IDs for debugging
</instruction>

<instruction>
Create health check endpoint for monitoring systems
</instruction>

### Task 4.2: Performance Optimization

<instruction>
Profile the application using Node.js profiling tools to identify bottlenecks
</instruction>

<instruction>
Implement caching for expensive operations (if any)
</instruction>

<instruction>
Add connection pooling if database persistence is implemented
</instruction>

<instruction>
Optimize Docker image size in Dockerfile:
- Use multi-stage builds
- Minimize layer count
- Use alpine base image
</instruction>

### Task 4.3: CI/CD Pipeline

<instruction>
Create .github/workflows/ci.yml with:
- Automated testing on pull requests
- Linting and formatting checks
- Security vulnerability scanning
- Build verification
</instruction>

<instruction>
Create .github/workflows/release.yml for automated releases:
- Semantic versioning
- Changelog generation
- Docker image publishing
- NPM package publishing
</instruction>

<instruction>
Add security scanning with:
- Dependabot for dependency updates
- CodeQL for code security analysis
- Container image vulnerability scanning
</instruction>

<instruction>
Configure automated quality gates:
- Minimum test coverage (80%)
- No linting errors
- No security vulnerabilities
- Successful builds
</instruction>

---

## VALIDATION CHECKLIST

After completing each phase, verify:

### Phase 1 Validation:
<instruction>
Test that SequentialThinkingServer no longer leaks memory between sessions
</instruction>

<instruction>
Verify all validation errors are properly caught and handled
</instruction>

<instruction>
Confirm no unsafe type assertions remain in newer server classes
</instruction>

<instruction>
Test input size limits and sanitization
</instruction>

### Phase 2 Validation:
<instruction>
Verify all functionality works after code reorganization
</instruction>

<instruction>
Confirm error handling provides useful information for debugging
</instruction>

<instruction>
Test that each server can be developed and tested independently
</instruction>

### Phase 3 Validation:
<instruction>
Achieve 80%+ test coverage
</instruction>

<instruction>
Verify linting passes with no errors
</instruction>

<instruction>
Confirm documentation is complete and accurate
</instruction>

### Phase 4 Validation:
<instruction>
Verify logging provides useful operational insights
</instruction>

<instruction>
Confirm CI/CD pipeline catches issues before deployment
</instruction>

<instruction>
Test performance under load
</instruction>

---

## SUCCESS CRITERIA

The build plan is complete when:
1. ✅ No memory leaks or state management issues
2. ✅ All input validation is type-safe and secure
3. ✅ Codebase is modular and maintainable
4. ✅ 80%+ test coverage with comprehensive test suite
5. ✅ Automated quality checks prevent regressions
6. ✅ Documentation enables easy onboarding and extension
7. ✅ Production-ready logging and monitoring
8. ✅ Automated CI/CD pipeline ensures quality

## NOTES FOR IMPLEMENTATION

- Prioritize Phase 1 tasks as they address critical security and stability issues
- Each phase can have tasks worked on in parallel where dependencies allow
- Test thoroughly after each major change to avoid breaking existing functionality
- Consider backward compatibility when refactoring APIs
- Document any breaking changes clearly
- Use feature flags if gradual rollout is needed
