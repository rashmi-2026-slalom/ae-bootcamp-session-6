<!--
SYNC IMPACT REPORT
==================
Version: 0.0.0 → 1.0.0 (MAJOR - Initial constitution establishment)
Date: 2026-05-27

PRINCIPLES ESTABLISHED:
- I. Code Quality & Simplicity (NEW)
- II. Test-Driven Development (NEW)
- III. Monorepo Architecture (NEW)
- IV. User Experience & Accessibility (NEW)
- V. Error Handling & Reliability (NEW)
- VI. Code Standards & Consistency (NEW)

SECTIONS ADDED:
- Core Principles (6 principles)
- Technology Stack & Constraints
- Development Workflow
- Governance

TEMPLATES REQUIRING UPDATES:
- ✅ spec-template.md (verified - aligned with principles)
- ✅ plan-template.md (verified - aligned with principles)
- ✅ tasks-template.md (verified - aligned with principles)

DERIVED FROM:
- docs/coding-guidelines.md
- docs/functional-requirements.md
- docs/testing-guidelines.md
- docs/ui-guidelines.md
- docs/project-overview.md

FOLLOW-UP: None - all placeholders resolved
-->

# AE Bootcamp Todo App Constitution

## Core Principles

### I. Code Quality & Simplicity
**MUST** follow these quality principles in all code:
- **DRY (Don't Repeat Yourself)**: Extract common code into shared functions/utilities; no duplication of logic across the codebase
- **KISS (Keep It Simple)**: Prefer simple, straightforward implementations; optimize only when necessary; code must be readable at first glance
- **SOLID Principles**: Single Responsibility (one reason to change), Open/Closed (extend via composition), clear interfaces, dependency injection where appropriate

**Rationale**: Maintainable code is simple code. Complex solutions increase cognitive load and bug surface area.

### II. Test-Driven Development (NON-NEGOTIABLE)
**MUST** follow test-driven development practices:
- Write tests as part of development (TDD workflow: Test → Fail → Implement → Pass → Refactor)
- **Target Coverage**: Minimum 80% code coverage across all packages
- **Test Behavior, Not Implementation**: Tests verify what code does, not how it does it
- **Test Isolation**: Each test is independent with no shared state; mock external dependencies
- Tests organized in `__tests__/` directories colocated with source files

**Rationale**: Tests document expected behavior, catch regressions, and enable confident refactoring. TDD ensures testable, well-designed code from the start.

### III. Monorepo Architecture
**MUST** maintain clear monorepo structure:
- Organized using npm workspaces: `packages/frontend/` (React) and `packages/backend/` (Express.js)
- Each package is self-contained with its own dependencies, tests, and scripts
- Consistent directory structure within each package (components, services, utils, __tests__)
- Run commands from root using workspace flags or within individual package directories
- No circular dependencies between packages

**Rationale**: Monorepo structure with clear boundaries enables independent development and testing while sharing tooling and configuration.

### IV. User Experience & Accessibility
**MUST** adhere to UX and accessibility standards:
- **Material Design Principles**: Elevation with subtle shadows, strategic color use, clear typography hierarchy, 4-8px border radius
- **WCAG AA Compliance**: Color contrast meets accessibility standards, keyboard navigation supported, proper ARIA labels, visible focus indicators
- **Responsive Design**: Mobile-first with breakpoints at 768px (tablet) and 1024px (desktop)
- **Theme Support**: Light and dark modes with system preference detection and localStorage persistence
- **8px Grid System**: All spacing follows 8px increments (xs=8px, sm=16px, md=24px, lg=32px, xl=48px)

**Rationale**: Accessible, well-designed interfaces serve all users and reflect professional quality standards.

### V. Error Handling & Reliability
**MUST** handle errors gracefully:
- Try-catch blocks around all operations that can fail (API calls, async operations)
- **Meaningful Error Messages**: Clear, actionable feedback for users; detailed logging for developers
- **User Feedback**: Inform users when operations fail with recovery guidance
- Validation at API boundaries to prevent undefined errors
- Default values and guard clauses to handle missing data

**Rationale**: Software fails; handling failures gracefully builds user trust and simplifies debugging.

### VI. Code Standards & Consistency
**MUST** follow these coding standards:
- **Naming Conventions**: `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPER_SNAKE_CASE` for constants
- **Indentation**: 2 spaces (JavaScript, JSON, CSS, Markdown)
- **Import Organization**: External libraries first, then internal modules, then styles; separated by blank lines
- **Line Length**: Under 100 characters for code readability
- **ESLint Compliance**: All ESLint rules must pass; no unused variables, proper error handling, consistent arrow functions
- **File Organization**: Imports → Constants → Main code → Helpers → Exports
- **No Trailing Whitespace**: Clean line endings with LF (Unix-style)

**Rationale**: Consistent code style reduces cognitive load and makes code review efficient.

## Technology Stack & Constraints

**Frontend Stack** (REQUIRED):
- React 18+
- React DOM
- CSS for styling (Material Design-inspired)
- Jest + React Testing Library for testing

**Backend Stack** (REQUIRED):
- Node.js (v16+)
- Express.js
- Jest for testing

**Build & Development**:
- npm (v7+) for package management
- npm workspaces for monorepo management
- No database schema changes beyond basic todo storage (in-memory or simple file-based persistence)

**Constraints**:
- Single-user application (no authentication/authorization required)
- Desktop-focused (responsive but no mobile-specific optimization)
- No advanced features: filtering, search, undo/redo, bulk operations, categories

## Development Workflow

**Git Practices** (REQUIRED):
- **Atomic Commits**: Each commit represents one logical change
- **Clear Commit Messages**: Format: `type: description` (e.g., `feat: add todo deletion`, `fix: correct date formatting`)
- **Feature Branches**: Use `feature/{description}` naming convention
- **Pull Requests**: All changes reviewed via PR before merging to main

**Testing Workflow**:
1. Write tests for new features (TDD: failing test first)
2. Implement feature to make tests pass
3. Run tests locally before committing: `npm test`
4. Ensure coverage remains ≥80%: `npm test -- --coverage`
5. All tests must pass before creating PR

**Code Review Checklist**:
- ESLint passes with no warnings/errors
- Tests pass and coverage meets threshold
- Code follows naming and organization conventions
- Error handling is comprehensive
- Accessibility standards met (WCAG AA)
- Changes are well-documented in commit messages

## Governance

**Authority**: This constitution supersedes all other development practices and guidelines. When conflicts arise between this constitution and other documentation, the constitution takes precedence.

**Amendments**:
- Constitution changes require documentation of rationale and impact
- Version follows semantic versioning: MAJOR (breaking changes to principles), MINOR (new principles/sections), PATCH (clarifications/typo fixes)
- All dependent templates (spec, plan, tasks) must be updated when constitution changes
- Amendment process includes impact analysis and sync report

**Compliance**:
- All pull requests must verify compliance with constitutional principles
- Test coverage < 80% blocks merge
- ESLint violations block merge
- Accessibility violations (contrast, keyboard nav) block merge
- Principle violations must be justified and documented (technical debt tracked)

**Versioning Policy**:
- MAJOR: Backward-incompatible principle changes or removals
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording improvements, non-semantic refinements

**Review Cadence**: Constitution reviewed at project milestones or when patterns emerge that suggest principle gaps.

**Version**: 1.0.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-27
