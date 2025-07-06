module.exports = (app, db) => {
  const { v4: uuidv4 } = require('uuid');

  app.get('/tasks', async (req, res) => {
    await db.read();
    res.json(db.data.tasks);
  });

  app.get('/users', async (req, res) => {
    await db.read();
    res.json(db.data.users);
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

  // Update an existing task
  app.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const task = db.data.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'task not found' });

    const { name, assignedTo, dueDate, points } = req.body;
    if (name !== undefined) task.name = name;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (points !== undefined) task.points = Number(points) || 0;

    await db.write();
    res.json(task);
  });

  app.post('/users', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const user = {
      id: uuidv4(),
      name,
      totalPoints: 0,
      completedTasks: 0
    };
    await db.read();
    db.data.users.push(user);
    await db.write();
    res.json(user);
  });
};
