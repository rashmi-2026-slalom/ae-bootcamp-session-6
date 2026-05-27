const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const TodoService = require('./services/todoService');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    dueDate TEXT,
    completed BOOLEAN DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Initialize TodoService
const todoService = new TodoService(db);

// Insert some initial data
const initialTodos = [
  { title: 'Learn React', dueDate: '2025-12-15', completed: 0 },
  { title: 'Build TODO app', dueDate: '2025-12-31', completed: 0 },
  { title: 'Master Copilot', dueDate: null, completed: 1 }
];

const insertStmt = db.prepare('INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)');

initialTodos.forEach(todo => {
  insertStmt.run(todo.title, todo.dueDate, todo.completed);
});

console.log('In-memory database initialized with sample todos');

// API Routes
app.get('/api/todos', (req, res) => {
  try {
    const todos = todoService.getAllTodos();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.get('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const todo = todoService.getTodoById(id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    if (error.message.includes('Valid todo ID is required')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const newTodo = todoService.createTodo(title, dueDate);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    if (error.message.includes('required') || error.message.includes('exceed')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate } = req.body;
    const updatedTodo = todoService.updateTodo(id, { title, dueDate });
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('required') || error.message.includes('exceed') || error.message.includes('non-empty')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const updatedTodo = todoService.updateTodoStatus(id);
    res.json(updatedTodo);
  } catch (error) {
    console.error('Error toggling todo status:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Valid todo ID is required')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to toggle todo status' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = todoService.deleteTodo(id);
    res.json({ message: 'Todo deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting todo:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Valid todo ID is required')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Backward compatibility: support old items endpoints
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT id, title as name, createdAt as created_at FROM todos ORDER BY createdAt DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const stmt = db.prepare('INSERT INTO todos (title, dueDate, completed) VALUES (?, ?, ?)');
    const result = stmt.run(name, null, 0);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT id, title as name, createdAt as created_at FROM todos WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db };