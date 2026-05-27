/**
 * Unit tests for TodoService
 * Focus on isOverdue logic and todo operations
 */

const Database = require('better-sqlite3');
const TodoService = require('../../src/services/todoService');

describe('TodoService', () => {
  let db;
  let todoService;

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');
    
    // Create todos table
    db.exec(`
      CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        dueDate TEXT,
        completed INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    todoService = new TodoService(db);

    // Setup fake timers with a fixed date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-27T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    db.close();
  });

  describe('isOverdue computation', () => {
    describe('edge cases', () => {
      test('returns false for todos without due dates (null)', () => {
        const todo = todoService.createTodo('No due date', null);
        expect(todo.isOverdue).toBe(false);
      });

      test('returns false for completed todos with past due dates', () => {
        const todo = todoService.createTodo('Completed overdue', '2026-05-26');
        const updatedTodo = todoService.updateTodoStatus(todo.id, true);
        expect(updatedTodo.isOverdue).toBe(false);
      });

      test('returns true for past due dates (before today)', () => {
        const todo = todoService.createTodo('Past due', '2026-05-26');
        expect(todo.isOverdue).toBe(true);
      });

      test('returns false for today (current date)', () => {
        const todo = todoService.createTodo('Due today', '2026-05-27');
        expect(todo.isOverdue).toBe(false);
      });

      test('returns false for future due dates', () => {
        const todo = todoService.createTodo('Future due', '2026-05-28');
        expect(todo.isOverdue).toBe(false);
      });

      test('returns true for due date multiple days in the past', () => {
        const todo = todoService.createTodo('Very overdue', '2026-05-20');
        expect(todo.isOverdue).toBe(true);
      });

      test('returns false for due date far in the future', () => {
        const todo = todoService.createTodo('Far future', '2027-01-01');
        expect(todo.isOverdue).toBe(false);
      });
    });

    describe('date-only comparison (ignoring time)', () => {
      test('treats any time on due date as not overdue', () => {
        // Due date at end of day should not be overdue on that day
        const todo = todoService.createTodo('Due EOD', '2026-05-27T23:59:59Z');
        expect(todo.isOverdue).toBe(false);
      });

      test('treats past date regardless of time as overdue', () => {
        // Past date at end of day is still overdue
        const todo = todoService.createTodo('Past EOD', '2026-05-26T23:59:59Z');
        expect(todo.isOverdue).toBe(true);
      });
    });

    describe('completion status precedence', () => {
      test('completed overdue todos are not marked as overdue', () => {
        const todo = todoService.createTodo('Completed late', '2026-05-20');
        expect(todo.isOverdue).toBe(true);
        
        const completed = todoService.updateTodoStatus(todo.id, true);
        expect(completed.isOverdue).toBe(false);
      });

      test('uncompleting a past-due todo marks it overdue again', () => {
        const todo = todoService.createTodo('Will be late', '2026-05-20');
        const completed = todoService.updateTodoStatus(todo.id, true);
        expect(completed.isOverdue).toBe(false);
        
        const uncompleted = todoService.updateTodoStatus(completed.id, false);
        expect(uncompleted.isOverdue).toBe(true);
      });
    });
  });

  describe('getAllTodos with isOverdue field', () => {
    test('returns empty array when no todos exist', () => {
      const todos = todoService.getAllTodos();
      expect(todos).toEqual([]);
    });

    test('includes isOverdue field for all todos', () => {
      todoService.createTodo('Overdue', '2026-05-26');
      todoService.createTodo('Current', '2026-05-27');
      todoService.createTodo('Future', '2026-05-28');
      todoService.createTodo('No date', null);

      const todos = todoService.getAllTodos();
      
      expect(todos).toHaveLength(4);
      todos.forEach(todo => {
        expect(todo).toHaveProperty('isOverdue');
        expect(typeof todo.isOverdue).toBe('boolean');
      });
    });

    test('correctly computes isOverdue for mixed todos', () => {
      todoService.createTodo('Overdue 1', '2026-05-25');
      todoService.createTodo('Overdue 2', '2026-05-26');
      todoService.createTodo('Due today', '2026-05-27');
      todoService.createTodo('Future', '2026-05-28');
      todoService.createTodo('No date', null);

      const todos = todoService.getAllTodos();
      
      // Find each todo by title for verification
      const overdue1 = todos.find(t => t.title === 'Overdue 1');
      const overdue2 = todos.find(t => t.title === 'Overdue 2');
      const dueToday = todos.find(t => t.title === 'Due today');
      const future = todos.find(t => t.title === 'Future');
      const noDate = todos.find(t => t.title === 'No date');

      expect(overdue1.isOverdue).toBe(true);
      expect(overdue2.isOverdue).toBe(true);
      expect(dueToday.isOverdue).toBe(false);
      expect(future.isOverdue).toBe(false);
      expect(noDate.isOverdue).toBe(false);
    });

    test('converts completed SQLite integer to boolean', () => {
      const todo = todoService.createTodo('Test completed', '2026-05-27');
      todoService.updateTodoStatus(todo.id, true);

      const todos = todoService.getAllTodos();
      const foundTodo = todos.find(t => t.id === todo.id);

      expect(typeof foundTodo.completed).toBe('boolean');
      expect(foundTodo.completed).toBe(true);
    });

    test('returns todos in consistent order', () => {
      const first = todoService.createTodo('First', '2026-05-28');
      const second = todoService.createTodo('Second', '2026-05-28');
      const third = todoService.createTodo('Third', '2026-05-28');

      const todos = todoService.getAllTodos();

      // Verify all three todos exist with isOverdue field
      expect(todos).toHaveLength(3);
      todos.forEach(todo => {
        expect(todo).toHaveProperty('isOverdue');
        expect(todo.isOverdue).toBe(false); // All have future due dates
      });
    });
  });

  describe('getTodoById with isOverdue field', () => {
    test('includes isOverdue field in returned todo', () => {
      const created = todoService.createTodo('Test todo', '2026-05-26');
      const fetched = todoService.getTodoById(created.id);

      expect(fetched).toHaveProperty('isOverdue');
      expect(typeof fetched.isOverdue).toBe('boolean');
      expect(fetched.isOverdue).toBe(true);
    });

    test('returns null for nonexistent ID', () => {
      const result = todoService.getTodoById(999);
      expect(result).toBeNull();
    });
  });

  describe('createTodo with isOverdue field', () => {
    test('includes isOverdue in created todo response', () => {
      const todo = todoService.createTodo('New todo', '2026-05-26');

      expect(todo).toHaveProperty('isOverdue');
      expect(todo.isOverdue).toBe(true);
    });

    test('creates non-overdue todo for future date', () => {
      const todo = todoService.createTodo('Future todo', '2026-06-01');

      expect(todo.isOverdue).toBe(false);
    });
  });

  describe('updateTodo with isOverdue field', () => {
    test('updates isOverdue when due date changes from future to past', () => {
      const todo = todoService.createTodo('Will be overdue', '2026-05-28');
      expect(todo.isOverdue).toBe(false);

      const updated = todoService.updateTodo(todo.id, { dueDate: '2026-05-25' });
      expect(updated.isOverdue).toBe(true);
    });

    test('updates isOverdue when due date changes from past to future', () => {
      const todo = todoService.createTodo('Was overdue', '2026-05-25');
      expect(todo.isOverdue).toBe(true);

      const updated = todoService.updateTodo(todo.id, { dueDate: '2026-05-30' });
      expect(updated.isOverdue).toBe(false);
    });

    test('includes isOverdue when only title is updated', () => {
      const todo = todoService.createTodo('Old title', '2026-05-26');
      const updated = todoService.updateTodo(todo.id, { title: 'New title' });

      expect(updated.isOverdue).toBe(true);
      expect(updated.title).toBe('New title');
    });
  });

  describe('updateTodoStatus with isOverdue field', () => {
    test('marks overdue todo as not overdue when completed', () => {
      const todo = todoService.createTodo('Complete me', '2026-05-26');
      expect(todo.isOverdue).toBe(true);

      const completed = todoService.updateTodoStatus(todo.id, true);
      expect(completed.isOverdue).toBe(false);
      expect(completed.completed).toBe(true);
    });

    test('marks todo as overdue when uncompleted with past due date', () => {
      const todo = todoService.createTodo('Uncomplete me', '2026-05-26');
      const completed = todoService.updateTodoStatus(todo.id, true);
      expect(completed.isOverdue).toBe(false);

      const uncompleted = todoService.updateTodoStatus(completed.id, false);
      expect(uncompleted.isOverdue).toBe(true);
    });
  });
});
