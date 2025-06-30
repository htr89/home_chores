const express = require('express');
const { Low, JSONFile } = require('lowdb');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

async function initDb() {
  await db.read();
  db.data ||= { tasks: [] };
  await db.write();
}

initDb();

app.use(express.json());

app.get('/tasks', async (req, res) => {
  await db.read();
  res.json(db.data.tasks);
});

app.post('/tasks', async (req, res) => {
  const { name, assignedTo, dueDate, points } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const task = {
    id: uuidv4(),
    name,
    assignedTo,
    dueDate,
    points: Number(points) || 0,
    createdAt: new Date().toISOString()
  };
  await db.read();
  db.data.tasks.push(task);
  await db.write();
  res.json(task);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
