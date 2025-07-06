module.exports = (app, db) => {
  const { v4: uuidv4 } = require('uuid');

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
};
