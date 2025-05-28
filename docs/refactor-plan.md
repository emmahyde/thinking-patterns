# Refactor Plan for Code Simplicity

This document outlines a comprehensive refactoring strategy to DRY out and simplify the codebase, based on analysis of the current project structure.

## Overview

The current codebase contains significant duplication across server modules, validation logic, and UI formatting. The following three major refactors will dramatically reduce code duplication and improve maintainability.

## 1. Generic Server Module Framework

### Current Problem
- Every `*XxxServer*` class contains identical skeleton code:
  - `validateInput` → `formatOutput/enrich` → return `{content, isError}` with identical error-handling boilerplate
- `index.ts` manually instantiates each server and uses hand-written switch statements for routing

### Proposed Solution
Create an abstract `BaseToolServer<TIn, TOut>` that provides:
- A `validate(input): TIn` hook (defaults to a zod/ajv schema passed via constructor)
- A `handle(valid: TIn): TOut` hook implemented by concrete servers
- A `run = (raw) => { try { … } catch { … } }` wrapper that standardizes the `{content, isError}` envelope

**Registry-based routing:**
```typescript
const tools = [
  { name: "mental_model", schema: MentalModelSchema, server: new MentalModelServer() },
  { name: "sequential_thinking", schema: SequentialThinkingSchema, server: new SequentialThinkingServer() },
  // Add more tools here
] as const;
```

**Simplified routing:**
Replace the giant `switch` with:
```typescript
tools.find(t => t.name === req).server.run(req.params.arguments)
```

### Benefits
- ~250 duplicated lines disappear
- Adding a new tool becomes a 3-line entry in the registry
- Consistent error handling across all tools
- Type safety with generics

## 2. Centralized Schema Definitions

### Current Problem
- Each `validateXData` method manually checks every field
- Re-implements the same "type guard" logic everywhere
- Returns manually casted objects

### Proposed Solution
Define schema files using Zod for each domain object:

```typescript
export const ThoughtSchema = z.object({
  thought: z.string(),
  thoughtNumber: z.number().int().positive(),
  totalThoughts: z.number().int().positive(),
  nextThoughtNeeded: z.boolean(),
  isRevision: z.boolean().optional(),
  revisesThought: z.number().int().positive().optional(),
  branchFromThought: z.number().int().positive().optional(),
  branchId: z.string().optional(),
  needsMoreThoughts: z.boolean().optional(),
});

export type ThoughtData = z.infer<typeof ThoughtSchema>;
```

`BaseToolServer` simply calls `schema.parse(raw)` - no hand-written validators needed.

### Benefits
- Eliminates hundreds of lines of code
- Provides much clearer validation errors
- Editor autocomplete for free
- Type safety throughout the application
- Single source of truth for data structures

## 3. Shared UI/Formatting Helpers

### Current Problem
- Each server re-implements "draw a box with a border"
- Duplicated logic for calculating `border.length`, padding strings, coloring headers

### Proposed Solution
Create `src/utils/prettyBox.ts`:

```typescript
export function boxed(title: string, sections: Record<string, string | string[]>): string {
  // Implementation for consistent box formatting
  // Handle borders, padding, colors, etc.
}

export function formatHeader(text: string, emoji?: string): string {
  // Consistent header formatting
}

export function formatSection(title: string, content: string | string[]): string {
  // Consistent section formatting
}
```

**Usage in servers:**
```typescript
console.error(boxed("🧠 Mental Model", {
  Problem: problem,
  Steps: steps,
  Reasoning: reasoning,
  Conclusion: conclusion
}));
```

### Benefits
- Halves the code inside each server
- Ensures consistent CLI output
- Changing styles requires only a single-file edit
- Better separation of concerns

## 4. Comprehensive Testing Strategy

### Current Testing Gaps
- Limited or missing unit tests for existing server classes
- No validation testing for schema parsing
- No integration tests for the MCP server functionality
- Missing error handling and edge case coverage

### Proposed Testing Framework
Implement a robust testing strategy using:
- **Jest** for unit and integration testing
- **@types/jest** for TypeScript support
- **ts-jest** for TypeScript compilation
- **jest-mock-extended** for advanced mocking

### Testing Requirements

#### Base Framework Tests
```typescript
// tests/base/BaseToolServer.test.ts
describe('BaseToolServer', () => {
  // Test abstract class functionality
  // Test error handling wrapper
  // Test schema validation integration
  // Test generic type safety
});
```

#### Schema Validation Tests
```typescript
// tests/schemas/ThoughtSchema.test.ts
describe('ThoughtSchema', () => {
  // Test valid input parsing
  // Test invalid input rejection
  // Test optional field handling
  // Test type inference accuracy
});
```

#### UI Utilities Tests
```typescript
// tests/utils/prettyBox.test.ts
describe('prettyBox utilities', () => {
  // Test box formatting output
  // Test border calculations
  // Test section formatting
  // Test special character handling
});
```

#### Integration Tests
```typescript
// tests/integration/toolRegistry.test.ts
describe('Tool Registry System', () => {
  // Test tool discovery and routing
  // Test end-to-end request processing
  // Test error propagation
  // Test MCP protocol compliance
});
```

#### Existing Code Coverage
- **SequentialThinkingServer**: Add comprehensive unit tests
- **SessionManager**: Test session lifecycle and state management
- **ToolRecommendationEngine**: Test recommendation logic and algorithms
- **CustomErrors**: Test error types and serialization

### Test Structure
```
tests/
├── base/
│   └── BaseToolServer.test.ts
├── schemas/
│   ├── ThoughtSchema.test.ts
│   └── schemas.test.ts
├── utils/
│   └── prettyBox.test.ts
├── servers/
│   └── SequentialThinkingServer.test.ts
├── services/
│   ├── SessionManager.test.ts
│   └── ToolRecommendationEngine.test.ts
├── integration/
│   ├── toolRegistry.test.ts
│   └── mcpProtocol.test.ts
└── helpers/
    ├── testFixtures.ts
    └── mockFactories.ts
```

### Testing Guidelines
1. **Unit Tests**: Minimum 90% code coverage for new components
2. **Integration Tests**: Cover all public API endpoints and MCP tool interactions
3. **Schema Tests**: Validate all possible input combinations and edge cases
4. **Error Testing**: Ensure all error paths are tested and properly handled
5. **Performance Tests**: Verify response times and memory usage for large inputs

### Mock Strategy
- Mock external dependencies (file system, network calls)
- Create factory functions for test data generation
- Use dependency injection to enable easier testing
- Isolate units under test from their dependencies

## Implementation Priority

### Phase 1: Schema Centralization
1. Create `src/schemas/` directory
2. Define Zod schemas for all existing data types
3. Update existing validation methods to use schemas
4. Remove manual validation code

### Phase 2: Base Server Framework
1. Create `src/base/BaseToolServer.ts`
2. Define the abstract base class with generics
3. Create tool registry system
4. Migrate existing servers to extend BaseToolServer
5. Update routing in `index.ts`

### Phase 3: UI Utilities
1. Create `src/utils/prettyBox.ts`
2. Extract common formatting functions
3. Update all servers to use shared utilities
4. Remove duplicated formatting code

### Phase 4: Comprehensive Testing Implementation
1. **Setup Testing Infrastructure**
   - Install Jest, ts-jest, and testing utilities (`npm install --save-dev jest @types/jest ts-jest jest-mock-extended`)
   - Configure Jest for TypeScript and MCP testing
   - Create test helper utilities and mock factories

2. **Base Framework Testing**
   - Write comprehensive tests for `BaseToolServer`
   - Test error handling and validation workflows
   - Verify generic type constraints and safety

3. **Schema Validation Testing**
   - Test all Zod schemas with valid/invalid inputs
   - Verify type inference and runtime validation
   - Test edge cases and boundary conditions

4. **UI Utilities Testing**
   - Test formatting functions with various inputs
   - Verify consistent output formatting
   - Test special characters and edge cases

5. **Integration Testing**
   - Test complete tool registry workflow
   - Verify MCP protocol compliance
   - Test error propagation and handling

6. **Legacy Code Testing**
   - Add missing tests for existing servers (`SequentialThinkingServer`)
   - Test session management (`SessionManager`)
   - Test recommendation engine (`ToolRecommendationEngine`)
   - Test custom error handling (`CustomErrors`)

7. **Test Coverage & CI Integration**
   - Configure code coverage reporting
   - Set up automated testing in CI/CD pipeline
   - Establish coverage thresholds (minimum 90% for new code)

## Expected Outcomes

After implementing these refactors:
- **Code Reduction**: Remove large swaths of repetitive code (validation, error handling, output formatting)
- **Cognitive Load**: Reduce mental overhead when adding new thinking tools
- **Architecture**: Clean separation of responsibilities (schema definition, business logic, presentation)
- **Maintainability**: Single points of change for common functionality
- **Type Safety**: Compile-time guarantees for data structures and API contracts

## Files to Create/Modify

### New Files

#### Framework & Architecture
- `src/base/BaseToolServer.ts`
- `src/schemas/ThoughtSchema.ts`
- `src/schemas/index.ts` (barrel export)
- `src/utils/prettyBox.ts`
- `src/utils/index.ts` (barrel export)

#### Testing Infrastructure
- `jest.config.js` (Jest configuration)
- `tests/helpers/testFixtures.ts`
- `tests/helpers/mockFactories.ts`

#### Unit Tests
- `tests/base/BaseToolServer.test.ts`
- `tests/schemas/ThoughtSchema.test.ts`
- `tests/schemas/schemas.test.ts`
- `tests/utils/prettyBox.test.ts`
- `tests/servers/SequentialThinkingServer.test.ts`
- `tests/services/SessionManager.test.ts`
- `tests/services/ToolRecommendationEngine.test.ts`
- `tests/errors/CustomErrors.test.ts`

#### Integration Tests
- `tests/integration/toolRegistry.test.ts`
- `tests/integration/mcpProtocol.test.ts`

### Modified Files
- `index.ts` (routing refactor)
- `src/servers/SequentialThinkingServer.ts` (extend BaseToolServer)
- `src/interfaces/ThoughtData.ts` (replace with schema-generated types)
- `package.json` (add testing dependencies and scripts)
- All existing server classes

### Expected Testing Coverage
- **New Code**: 100% test coverage for all new framework components
- **Legacy Code**: Minimum 90% coverage for existing services and servers
- **Integration**: Complete MCP protocol and tool registry testing
- **Error Paths**: All error conditions and edge cases covered

This refactoring plan will transform the codebase into a more maintainable, type-safe, and DRY architecture while ensuring comprehensive testing coverage for both new and existing functionality.
