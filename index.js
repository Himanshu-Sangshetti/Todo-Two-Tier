const express = require('express');
const mysql = require('mysql2/promise');
const uuid = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// Database connection setup
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


// Middleware
app.use(express.static('public'));
app.use(express.json());

// Create a new task
app.post('/tasks', async (req, res) => {
  const { taskName, dueDate } = req.body;
  const taskId = uuid.v4(); // Generate unique task ID

  try {
    await db.execute(
      'INSERT INTO Tasks (task_id, task_name, due_date, completed) VALUES (?, ?, ?, ?)',
      [taskId, taskName, dueDate, false]
    );
    res.status(201).json({ message: 'Task created successfully', taskId });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const [tasks] = await db.query('SELECT * FROM Tasks');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

// Get a task by ID
app.get('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const [task] = await db.query('SELECT * FROM Tasks WHERE task_id = ?', [taskId]);
    if (task.length > 0) {
      res.status(200).json(task[0]);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: 'Could not fetch task' });
  }
});

// Mark task as completed
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const [result] = await db.execute('UPDATE Tasks SET completed = ? WHERE task_id = ?', [true, taskId]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Task marked as completed' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// Delete a task
app.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM Tasks WHERE task_id = ?', [taskId]);
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
