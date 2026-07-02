const express = require('express');
const cors = require('cors');
const yup = require('yup');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let todos = [];
let nextId = 1;
let frontendProcess = null;

const todoSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  description: yup.string().nullable().default(''),
  completed: yup.boolean().default(false)
});

function checkPort(host, port) {
  return new Promise((resolve) => {
    const req = http.get({ host, port, path: '/' }, (res) => {
      res.resume();
      resolve(true);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

app.get('/api/status', async (req, res) => {
  const frontendReady = await checkPort('127.0.0.1', 5173);
  res.json({
    backend: true,
    frontend: frontendReady,
    frontendUrl: 'http://127.0.0.1:5173/'
  });
});

app.post('/api/start', async (req, res) => {
  const frontendReady = await checkPort('127.0.0.1', 5173);

  if (frontendReady) {
    return res.json({
      message: 'App is already running.',
      backend: true,
      frontend: true,
      frontendUrl: 'http://127.0.0.1:5173/'
    });
  }

  try {
    frontendProcess = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
      cwd: path.join(__dirname, 'todo-frontend'),
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    frontendProcess.stdout.on('data', (data) => {
      console.log(`[frontend] ${data.toString().trim()}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error(`[frontend] ${data.toString().trim()}`);
    });

    frontendProcess.on('exit', () => {
      frontendProcess = null;
    });

    res.json({
      message: 'Starting frontend...',
      backend: true,
      frontend: true,
      frontendUrl: 'http://127.0.0.1:5173/'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.post('/api/todos', async (req, res) => {
  try {
    const validated = await todoSchema.validate(req.body);
    const newTodo = {
      id: nextId++,
      ...validated,
      createdAt: new Date().toISOString()
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = todos.find((t) => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    const validated = await todoSchema.validate(req.body);
    Object.assign(todo, validated);
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex((t) => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  res.status(200).json({ message: 'Todo deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});