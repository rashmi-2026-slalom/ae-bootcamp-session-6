# Research: Overdue Todo Items

**Feature**: 001-overdue-todo-items  
**Date**: 2026-05-27  
**Status**: Complete

## Overview

This document consolidates research findings for implementing visual overdue indicators in the todo application. Research focused on date handling, accessibility, React optimization, and testing strategies.

---

## 1. Date Handling in JavaScript (Date-Only Comparison)

### Decision
Use date-only comparison by normalizing dates to midnight (00:00:00) in the local timezone before comparison.

### Implementation Pattern
```javascript
function isOverdue(dueDate) {
  if (!dueDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}
```

### Rationale
- **Consistent behavior**: Normalizing to midnight ensures that "today" is never considered overdue
- **Simple implementation**: Using `setHours(0, 0, 0, 0)` is the standard JavaScript approach for date-only comparison
- **Timezone-aware**: Uses local timezone automatically (matches user expectation)
- **Handles ISO strings**: `new Date()` constructor properly parses ISO 8601 date strings from the database

### Alternatives Considered
- **String comparison** (e.g., `dueDate < today.toISOString().split('T')[0]`): Rejected because string comparison doesn't handle timezone offsets and is error-prone
- **Date math with days** (e.g., `Math.floor(diff / (1000 * 60 * 60 * 24))`): Rejected because it's more complex and doesn't handle daylight saving time edge cases as cleanly
- **Third-party library** (e.g., date-fns, moment.js): Rejected because the built-in Date API is sufficient and avoids adding dependencies

---

## 2. Accessibility Best Practices for Visual Indicators

### Decision
Use **both color and icon** (dual indicators) with proper ARIA labels to meet WCAG AA standards.

### Implementation Approach
- **Color**: Orange/amber background tint or border (not relying on color alone)
- **Icon**: Clock/timer icon positioned consistently (e.g., left of title or as a prefix)
- **ARIA label**: Add `aria-label="Overdue"` to the icon for screen readers
- **Semantic HTML**: Use appropriate elements (e.g., `<span role="status">`) to convey meaning

### Rationale
- **WCAG 1.4.1 (Use of Color)**: Information cannot be conveyed by color alone; dual indicators ensure users with color blindness can identify overdue items
- **WCAG 2.4.6 (Headings and Labels)**: Descriptive labels help users understand the purpose of elements
- **Material Design guidance**: Recommends combining color with text or icons for status indicators

### Color Specifications
- **Overdue color**: `#F59E0B` (Amber 500) or similar orange/amber from Material palette
- **Contrast ratio**: Must maintain 4.5:1 contrast for text (WCAG AA Level AA)
- **Background tint**: Use light amber background (`#FEF3C7`) with darker text for subtle but clear indication

### Icon Choice
- **Clock icon**: Universally understood as time-related
- **Size**: 16-20px (consistent with Material Design icon sizing)
- **Positioning**: Before the todo title for left-to-right reading flow

### Alternatives Considered
- **Color only**: Rejected due to WCAG violations (fails accessibility for color-blind users)
- **Icon only**: Rejected because color provides immediate visual scanning benefit
- **Red color**: Rejected because orange/amber is less alarming and better aligns with "warning" vs. "error" semantics

---

## 3. React Performance for Real-Time Updates

### Decision
Compute overdue status on **every render** using a pure function (no memoization initially).

### Rationale
- **Simple and correct**: Date comparison is a fast operation (O(1)); premature optimization adds complexity
- **Real-time updates**: Ensures overdue status is always current when due dates change or time passes
- **React best practices**: Pure functions are easy to test and reason about
- **No stale data**: Avoids caching issues where overdue status becomes stale

### Implementation Pattern
```javascript
function TodoCard({ todo }) {
  const overdue = isOverdue(todo.dueDate);
  
  return (
    <div className={overdue ? 'todo-card overdue' : 'todo-card'}>
      {overdue && <ClockIcon aria-label="Overdue" />}
      <span>{todo.title}</span>
    </div>
  );
}
```

### When to Optimize
- If profiling shows performance issues with large lists (>1000 todos)
- Consider `useMemo` to memoize overdue calculation per todo
- Only optimize after measuring actual performance impact

### Alternatives Considered
- **Backend-computed property**: Rejected because it requires periodic recalculation on the server and doesn't handle real-time updates as cleanly
- **Memoization with `useMemo`**: Deferred as premature optimization; can be added later if needed
- **Web Workers**: Rejected as overkill for simple date comparison

---

## 4. Material Design Color Guidelines for Status Indicators

### Decision
Use **Amber 500 (`#F59E0B`)** for overdue styling with a light amber background tint.

### Rationale
- **Material Design semantic colors**:
  - Red: Errors and destructive actions
  - Amber/Orange: Warnings and attention-needed states
  - Green: Success and completion
- **Overdue = Warning**: Orange communicates "needs attention" without the severity of red
- **Consistency**: Aligns with existing Material Design patterns in the app

### Theme Integration
```css
/* Light Mode */
--overdue-text: #F59E0B;        /* Amber 500 */
--overdue-bg: #FEF3C7;          /* Amber 50 */
--overdue-border: #FCD34D;      /* Amber 300 */

/* Dark Mode */
--overdue-text: #FCD34D;        /* Amber 300 (lighter for dark bg) */
--overdue-bg: #78350F;          /* Amber 900 (dark tint) */
--overdue-border: #F59E0B;      /* Amber 500 */
```

### Alternatives Considered
- **Red (`#EF4444`)**: Rejected because red implies error/danger, which is too severe for overdue tasks
- **Gray with accent**: Rejected because it doesn't draw enough attention
- **Custom color outside Material palette**: Rejected to maintain design system consistency

---

## 5. Testing Strategies for Date-Based Logic

### Decision
Use **fixed date mocking** with Jest's `jest.useFakeTimers()` and `jest.setSystemTime()` to control "today" in tests.

### Implementation Pattern
```javascript
describe('isOverdue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-27T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns true for past due dates', () => {
    expect(isOverdue('2026-05-26')).toBe(true);
  });

  test('returns false for today', () => {
    expect(isOverdue('2026-05-27')).toBe(false);
  });

  test('returns false for future dates', () => {
    expect(isOverdue('2026-05-28')).toBe(false);
  });

  test('returns false for null/undefined due dates', () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue(undefined)).toBe(false);
  });
});
```

### Rationale
- **Deterministic tests**: Fake timers ensure tests always pass regardless of when they run
- **Jest built-in support**: No additional dependencies required
- **Easy to reason about**: Tests explicitly set the "current date" for clarity

### Frontend Component Testing
- **React Testing Library**: Render TodoCard with past/present/future due dates
- **Visual regression**: Verify overdue styling appears correctly
- **Accessibility**: Use `getByRole` and `getByLabelText` to ensure ARIA labels are present

### Backend API Testing
- **Supertest**: Verify GET /api/todos returns todos with computed overdue status (if added to API response)
- **Edge cases**: Test todos without due dates, completed overdue todos, boundary conditions

### Alternatives Considered
- **Relative date testing** (e.g., `new Date(Date.now() - 86400000)`): Rejected because it makes tests harder to read
- **Snapshot testing**: Complement to behavioral tests, but not a replacement (snapshots don't verify logic)

---

## Summary Table

| Research Area | Decision | Key Rationale |
|---------------|----------|---------------|
| **Date Comparison** | Normalize to midnight with `setHours(0,0,0,0)` | Simple, timezone-aware, handles ISO strings |
| **Accessibility** | Dual indicators (color + icon) with ARIA labels | WCAG AA compliance, color blindness support |
| **React Performance** | Compute on every render (pure function) | Fast operation, no premature optimization |
| **Color Scheme** | Amber 500 (`#F59E0B`) with light background | Material Design warning semantics |
| **Testing** | Jest fake timers with fixed dates | Deterministic, easy to understand |

---

## Open Questions (Resolved)

All research questions have been resolved. No remaining ambiguities for implementation.

---

## References

- [MDN Date Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Color System](https://m3.material.io/styles/color/system/overview)
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [React Testing Library Best Practices](https://testing-library.com/docs/queries/about)
