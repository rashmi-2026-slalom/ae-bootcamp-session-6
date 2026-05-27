# Implementation Plan: Overdue Todo Items

**Branch**: `001-overdue-todo-items` | **Date**: 2026-05-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-overdue-todo-items/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add visual indicators (orange/amber color + clock icon) to identify todo items that are overdue (due date before today using date-only comparison). This feature enhances user experience by making overdue tasks immediately visible without manual date checking, while maintaining the existing sort order and respecting completion status precedence.

## Technical Context

**Language/Version**: JavaScript (Node.js v16+, React 18+)

**Primary Dependencies**: Express.js 4.18.2 (backend), React 18.2.0 + React DOM (frontend), better-sqlite3 11.10.0 (storage), axios 1.9.0 (HTTP client)

**Storage**: SQLite database (better-sqlite3) with existing todos table (id, title, dueDate, completed, createdAt)

**Testing**: Jest 29.7.0 (backend), Jest + React Testing Library (frontend via react-scripts 5.0.1), supertest 6.3.3 (API testing), msw 1.3.2 (frontend mocking)

**Target Platform**: Desktop-focused web application (responsive design with mobile support)

**Project Type**: Web application (monorepo with npm workspaces: packages/frontend and packages/backend)

**Performance Goals**: Real-time overdue status updates (<1 second after due date modification), instant visual identification (<2 seconds for users to spot overdue items)

**Constraints**: Single-user application, no authentication required, 80% minimum test coverage (constitutional requirement), WCAG AA accessibility compliance

**Scale/Scope**: Small-scale todo application with in-memory/SQLite persistence, no advanced filtering or search features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

| Constitutional Principle | Compliance Status | Notes |
|--------------------------|-------------------|-------|
| **I. Code Quality & Simplicity** | ✅ PASS | Overdue logic is simple date comparison; no duplication or complexity. Follows KISS principle with straightforward implementation. |
| **II. Test-Driven Development** | ✅ PASS | TDD workflow will be followed: tests for overdue calculation, UI rendering, and edge cases. Expected 80%+ coverage. |
| **III. Monorepo Architecture** | ✅ PASS | Changes contained within existing packages/frontend and packages/backend structure. No architectural changes needed. |
| **IV. UX & Accessibility** | ✅ PASS | Orange/amber color + clock icon provides dual indicators (color + icon) for accessibility. Meets WCAG AA contrast requirements. Material Design styling maintained. |
| **V. Error Handling** | ✅ PASS | Date comparison with proper null/undefined handling for todos without due dates. Graceful handling of edge cases (completed todos, invalid dates). |
| **VI. Code Standards** | ✅ PASS | Will follow existing naming conventions (camelCase), file organization (colocated tests), and ESLint rules. |

**GATE RESULT**: ✅ **APPROVED** - All constitutional principles satisfied. No violations or exceptions required.

### Re-evaluation (After Phase 1 Design)

| Constitutional Principle | Compliance Status | Design Validation |
|--------------------------|-------------------|-------------------|
| **I. Code Quality & Simplicity** | ✅ PASS | Design confirms simple `isOverdue()` function with date normalization. No complex patterns introduced. Research validated KISS approach. |
| **II. Test-Driven Development** | ✅ PASS | Comprehensive test strategy documented in research.md and quickstart.md. Backend unit tests, API integration tests, frontend component tests, and accessibility tests all planned. Jest fake timers ensure deterministic tests. |
| **III. Monorepo Architecture** | ✅ PASS | Project structure section confirms changes stay within existing packages. No new dependencies or architectural shifts. Colocated tests maintained. |
| **IV. UX & Accessibility** | ✅ PASS | Research confirmed dual indicators (Amber 500 color + clock icon) with WCAG AA compliance. ARIA labels specified. Material Design color system used. Contrast ratios documented. |
| **V. Error Handling** | ✅ PASS | Data model documents null-safe logic, edge case handling (null dates, completed todos, invalid dates). API contract specifies error responses. |
| **VI. Code Standards** | ✅ PASS | Quickstart guide demonstrates camelCase naming (`isOverdue`), proper file organization, and adherence to existing patterns. |

**RE-EVALUATION RESULT**: ✅ **APPROVED** - Design artifacts confirm constitutional compliance. All principles satisfied. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todo-items/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── contracts/           # Phase 1 output (/speckit.plan command)
    └── overdue-api.md   # API contract for overdue status
```

### Source Code (repository root)

```text
packages/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── todoService.js       # Add isOverdue logic
│   │   └── app.js                   # API routes (existing)
│   └── __tests__/
│       ├── app.test.js              # Add overdue API tests
│       └── services/
│           └── todoService.test.js  # Add overdue logic tests
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TodoCard.js          # Add overdue styling
    │   │   └── __tests__/
    │   │       └── TodoCard.test.js # Add overdue UI tests
    │   ├── services/
    │   │   └── todoService.js       # Client-side overdue check (optional)
    │   └── styles/
    │       └── theme.css            # Add overdue color variables
    └── __tests__/
```

**Structure Decision**: Web application (Option 2) - Changes will be made in both frontend (UI styling + overdue detection) and backend (overdue calculation + API enhancement). Follows existing monorepo structure with colocated tests.
