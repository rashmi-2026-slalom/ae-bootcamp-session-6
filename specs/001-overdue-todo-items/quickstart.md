# Quick Start Guide: Overdue Todo Items

**Feature**: 001-overdue-todo-items  
**Date**: 2026-05-27  
**Branch**: `001-overdue-todo-items`

## Overview

This guide helps you get started implementing the overdue todo items feature. Follow these steps to add visual indicators (orange/amber color + clock icon) for todos that are past their due date.

---

## Prerequisites

- ✅ Git repository cloned and on branch `001-overdue-todo-items`
- ✅ Node.js v16+ installed
- ✅ Dependencies installed (`npm install` from root)
- ✅ Familiarity with React, Express.js, and Jest

---

## Quick Implementation Checklist

### Phase 1: Backend (Computed Property)

- [ ] **Step 1**: Add `isOverdue()` helper function to `packages/backend/src/services/todoService.js`
- [ ] **Step 2**: Modify `getAllTodos()` to include computed `isOverdue` field in response
- [ ] **Step 3**: Modify `getTodoById()` to include computed `isOverdue` field
- [ ] **Step 4**: Modify `createTodo()` and `updateTodo()` to return `isOverdue` in response
- [ ] **Step 5**: Write unit tests in `packages/backend/__tests__/services/todoService.test.js`
- [ ] **Step 6**: Write API integration tests in `packages/backend/__tests__/app.test.js`

### Phase 2: Frontend (Visual Styling)

- [ ] **Step 7**: Add clock icon component (or use existing icon library)
- [ ] **Step 8**: Add overdue CSS variables to `packages/frontend/src/styles/theme.css`
- [ ] **Step 9**: Modify `TodoCard.js` to display clock icon and amber styling when `isOverdue === true`
- [ ] **Step 10**: Write unit tests in `packages/frontend/src/components/__tests__/TodoCard.test.js`
- [ ] **Step 11**: Verify accessibility (color contrast, ARIA labels, keyboard navigation)

### Phase 3: Verification

- [ ] **Step 12**: Run all tests (`npm test` from root)
- [ ] **Step 13**: Manual testing (create todos with past/present/future due dates)
- [ ] **Step 14**: Verify 80%+ code coverage
- [ ] **Step 15**: Verify WCAG AA compliance (color contrast, screen reader compatibility)

---

## Step-by-Step Implementation

### Backend Implementation

#### 1. Add `isOverdue()` Helper Function

**File**: `packages/backend/src/services/todoService.js`

Add this helper function at the top of the class or as a utility:

```javascript
/**
 * Check if a todo is overdue
 * @param {Object} todo - Todo object with dueDate and completed fields
 * @returns {boolean} True if overdue, false otherwise
 */
function isOverdue(todo) {
  // Completed todos are never displayed as overdue
  if (todo.completed) return false;
  
  // Todos without due dates cannot be overdue
  if (!todo.dueDate) return false;
  
  // Date-only comparison (ignore time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(todo.dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}
```

#### 2. Modify `getAllTodos()` to Include `isOverdue`

```javascript
getAllTodos() {
  try {
    const todos = this.db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
    // Add computed isOverdue field to each todo
    return todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed), // Convert SQLite 0/1 to boolean
      isOverdue: isOverdue(todo)
    }));
  } catch (error) {
    throw new Error(`Failed to fetch todos: ${error.message}`);
  }
}
```

#### 3. Apply Same Pattern to Other Methods

Apply the same `isOverdue` computation to:
- `getTodoById(id)`
- `createTodo(title, dueDate)`
- `updateTodo(id, updates)`
- `toggleComplete(id)` (if exists)

**Pattern**:
```javascript
const todo = { /* fetched from database */ };
return {
  ...todo,
  completed: Boolean(todo.completed),
  isOverdue: isOverdue(todo)
};
```

---

### Frontend Implementation

#### 4. Add Overdue CSS Variables

**File**: `packages/frontend/src/styles/theme.css`

Add these CSS custom properties:

```css
:root {
  /* Overdue colors (Light Mode) */
  --overdue-text: #F59E0B;        /* Amber 500 */
  --overdue-bg: #FEF3C7;          /* Amber 50 - light tint */
  --overdue-border: #FCD34D;      /* Amber 300 */
  --overdue-icon: #F59E0B;        /* Amber 500 */
}

[data-theme="dark"] {
  /* Overdue colors (Dark Mode) */
  --overdue-text: #FCD34D;        /* Amber 300 - lighter for dark bg */
  --overdue-bg: #78350F;          /* Amber 900 - dark tint */
  --overdue-border: #F59E0B;      /* Amber 500 */
  --overdue-icon: #FCD34D;        /* Amber 300 */
}
```

#### 5. Add Overdue Styling to TodoCard

**File**: `packages/frontend/src/components/TodoCard.js`

Add overdue-specific styles and icon:

```javascript
function TodoCard({ todo, onToggle, onDelete, onEdit }) {
  const isOverdue = todo.isOverdue && !todo.completed;

  return (
    <div className={`todo-card ${isOverdue ? 'overdue' : ''}`}>
      {isOverdue && (
        <span className="overdue-icon" aria-label="Overdue" role="status">
          ⏰ {/* Replace with proper clock icon component */}
        </span>
      )}
      <span className={todo.completed ? 'completed' : ''}>{todo.title}</span>
      {/* ... rest of component */}
    </div>
  );
}
```

**File**: `packages/frontend/src/App.css` (or component-specific CSS)

```css
.todo-card.overdue {
  background-color: var(--overdue-bg);
  border-left: 4px solid var(--overdue-border);
}

.overdue-icon {
  color: var(--overdue-icon);
  margin-right: 8px;
  font-size: 1.2em;
}
```

---

### Testing

#### 6. Backend Tests

**File**: `packages/backend/__tests__/services/todoService.test.js`

Add these test cases:

```javascript
describe('isOverdue computation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-27T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns true for incomplete todo with past due date', () => {
    const todo = service.createTodo('Test todo', '2026-05-26');
    expect(todo.isOverdue).toBe(true);
  });

  test('returns false for todo with today as due date', () => {
    const todo = service.createTodo('Test todo', '2026-05-27');
    expect(todo.isOverdue).toBe(false);
  });

  test('returns false for completed todo with past due date', () => {
    const todo = service.createTodo('Test todo', '2026-05-26');
    service.toggleComplete(todo.id);
    const updated = service.getTodoById(todo.id);
    expect(updated.isOverdue).toBe(false);
  });

  test('returns false for todo without due date', () => {
    const todo = service.createTodo('Test todo', null);
    expect(todo.isOverdue).toBe(false);
  });
});
```

#### 7. Frontend Tests

**File**: `packages/frontend/src/components/__tests__/TodoCard.test.js`

Add these test cases:

```javascript
test('displays overdue styling for overdue todo', () => {
  const overdueTodo = {
    id: 1,
    title: 'Overdue task',
    dueDate: '2026-05-26',
    completed: false,
    isOverdue: true
  };
  
  render(<TodoCard todo={overdueTodo} />);
  
  expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Overdue');
  expect(screen.getByText('Overdue task').closest('.todo-card')).toHaveClass('overdue');
});

test('does not display overdue styling for completed overdue todo', () => {
  const completedTodo = {
    id: 1,
    title: 'Completed overdue task',
    dueDate: '2026-05-26',
    completed: true,
    isOverdue: false
  };
  
  render(<TodoCard todo={completedTodo} />);
  
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
```

---

## Running Tests

### Backend Tests
```bash
cd packages/backend
npm test
```

### Frontend Tests
```bash
cd packages/frontend
npm test
```

### All Tests (from root)
```bash
npm test
```

### Coverage Report
```bash
npm test -- --coverage
```

**Target**: ≥80% coverage (constitutional requirement)

---

## Manual Testing Checklist

1. **Create todo with past due date** → Verify orange background + clock icon appears
2. **Create todo with today's due date** → Verify NO overdue styling
3. **Create todo with future due date** → Verify NO overdue styling
4. **Create todo without due date** → Verify NO overdue styling
5. **Mark overdue todo as complete** → Verify overdue styling disappears
6. **Mark complete todo as incomplete** (if past due date) → Verify overdue styling reappears
7. **Edit todo's due date from future to past** → Verify overdue styling appears
8. **Edit todo's due date from past to future** → Verify overdue styling disappears

---

## Accessibility Verification

### Color Contrast
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Text on overdue background must meet **4.5:1** ratio (WCAG AA)

### Screen Reader
- Clock icon has `aria-label="Overdue"`
- Role `status` indicates dynamic content

### Keyboard Navigation
- Overdue todos are keyboard-navigable (same as non-overdue)
- Focus indicators remain visible on overdue todos

---

## Troubleshooting

### Issue: Overdue styling not appearing
- ✅ Check that `isOverdue` field is present in API response
- ✅ Verify CSS variables are defined in `theme.css`
- ✅ Check that `todo.completed` is `false`

### Issue: Tests failing with date comparison
- ✅ Ensure tests use `jest.useFakeTimers()` and `jest.setSystemTime()`
- ✅ Verify date normalization (`.setHours(0, 0, 0, 0)`)

### Issue: Coverage below 80%
- ✅ Add tests for edge cases (null dates, completed todos)
- ✅ Test both backend computation and frontend rendering

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/backend/src/services/todoService.js` | Add `isOverdue` computation logic |
| `packages/backend/__tests__/services/todoService.test.js` | Backend unit tests |
| `packages/backend/__tests__/app.test.js` | API integration tests |
| `packages/frontend/src/components/TodoCard.js` | Add overdue UI styling |
| `packages/frontend/src/styles/theme.css` | Add overdue CSS variables |
| `packages/frontend/src/components/__tests__/TodoCard.test.js` | Frontend component tests |

---

## Definition of Done

- ✅ All tests pass (`npm test`)
- ✅ Code coverage ≥80%
- ✅ ESLint passes with no errors
- ✅ Overdue todos display with clock icon + orange/amber styling
- ✅ Completed overdue todos do NOT show overdue styling
- ✅ Todos without due dates do NOT show overdue styling
- ✅ WCAG AA accessibility verified (contrast, ARIA labels)
- ✅ Manual testing scenarios completed

---

## Next Steps

After completing implementation:
1. Run `/speckit.tasks` to generate detailed task breakdown
2. Commit changes with clear commit message (e.g., `feat: add overdue todo visual indicators`)
3. Create pull request with reference to spec document
4. Request code review from team

---

## References

- [Feature Specification](spec.md)
- [Implementation Plan](plan.md)
- [Data Model](data-model.md)
- [API Contract](contracts/api-contract.md)
- [Research Document](research.md)
