/**
 * Todo Service
 * Business logic for todo operations
 */

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

class TodoService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Get all todos ordered by creation date (newest first)
   * @returns {Array} Array of todo objects with computed isOverdue field
   */
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

  /**
   * Get a single todo by ID
   * @param {number} id - Todo ID
   * @returns {Object|null} Todo object or null if not found (with computed isOverdue field)
   */
  getTodoById(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const todo = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
      if (!todo) return null;
      
      return {
        ...todo,
        completed: Boolean(todo.completed), // Convert SQLite 0/1 to boolean
        isOverdue: isOverdue(todo)
      };
    } catch (error) {
      throw new Error(`Failed to fetch todo: ${error.message}`);
    }
  }

  /**
   * Create a new todo
   * @param {string} title - Todo title (required, max 255 chars)
   * @param {string|null} dueDate - Due date in ISO format (optional)
   * @returns {Object} Created todo object with computed isOverdue field
   */
  createTodo(title, dueDate = null) {
    try {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Todo title is required');
      }

      if (title.length > 255) {
        throw new Error('Todo title must not exceed 255 characters');
      }

      const stmt = this.db.prepare(
        'INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)'
      );
      const result = stmt.run(title.trim(), dueDate || null, 0);
      const id = result.lastInsertRowid;

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to create todo: ${error.message}`);
    }
  }

  /**
   * Update a todo's title and/or due date
   * @param {number} id - Todo ID
   * @param {Object} updates - Object with title and/or dueDate
   * @returns {Object} Updated todo object with computed isOverdue field
   */
  updateTodo(id, updates = {}) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const { title, dueDate } = updates;

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          throw new Error('Todo title must be a non-empty string');
        }

        if (title.length > 255) {
          throw new Error('Todo title must not exceed 255 characters');
        }
      }

      const newTitle = title !== undefined ? title.trim() : existingTodo.title;
      const newDueDate = dueDate !== undefined ? dueDate : existingTodo.dueDate;

      const stmt = this.db.prepare('UPDATE todos SET title = ?, dueDate = ? WHERE id = ?');
      stmt.run(newTitle, newDueDate || null, id);

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to update todo: ${error.message}`);
    }
  }

  /**
   * Toggle the completion status of a todo
   * @param {number} id - Todo ID
   * @returns {Object} Updated todo object with computed isOverdue field
   */
  updateTodoStatus(id, completed) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const stmt = this.db.prepare('UPDATE todos SET completed = ? WHERE id = ?');
      const newCompleted = typeof completed === 'boolean' ? (completed ? 1 : 0) : (existingTodo.completed ? 0 : 1);
      stmt.run(newCompleted, id);

      return this.getTodoById(id);
    } catch (error) {
      throw new Error(`Failed to update todo status: ${error.message}`);
    }
  }

  /**
   * Delete a todo by ID
   * @param {number} id - Todo ID
   * @returns {Object} Deleted todo object
   */
  deleteTodo(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid todo ID is required');
      }

      const existingTodo = this.getTodoById(id);
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes > 0) {
        return existingTodo;
      } else {
        throw new Error('Todo not found');
      }
    } catch (error) {
      throw new Error(`Failed to delete todo: ${error.message}`);
    }
  }
}

module.exports = TodoService;
