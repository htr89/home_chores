const { v4: uuidv4 } = require('uuid');
const { normalizeDate, generateEvents, applyTaskData } = require('./utils');

function removeFavorites(db, ids) {
    db.data.users = db.data.users || [];
    db.data.users.forEach(u => {
        if (!Array.isArray(u.favorites)) return;
        u.favorites = u.favorites.filter(f => !ids.includes(f));
    });
}

module.exports = (app, db) => {
    app.get('/tasks', async (req, res) => {
        await db.read();
        res.json(db.data.tasks);
    });

    app.post('/tasks', async (req, res) => {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        const task = {
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        };
        try {
            applyTaskData(task, req.body);
            task.repetition = req.body.repetition || 'none';
            if (task.endDate === undefined) task.endDate = task.dueDate;
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
        await db.read();
        db.data.tasks.push(task);
        db.data.events.push(...generateEvents(task));
        await db.write();
        res.json(task);
    });

    app.patch('/tasks/:id', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const task = db.data.tasks.find(t => t.id === id);
        if (!task) return res.status(404).json({ error: 'task not found' });
        try {
            applyTaskData(task, req.body);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
        const removed = db.data.events.filter(e => e.taskId === id).map(e => e.id);
        db.data.events = db.data.events.filter(e => e.taskId !== id);
        removeFavorites(db, removed);
        db.data.events.push(...generateEvents(task));
        await db.write();
        res.json(task);
    });

    app.delete('/tasks/:id', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const idx = db.data.tasks.findIndex(t => t.id === id);
        if (idx === -1) return res.status(404).json({ error: 'task not found' });
        db.data.tasks.splice(idx, 1);
        const removed = db.data.events.filter(ev => ev.taskId === id).map(ev => ev.id);
        db.data.events = db.data.events.filter(ev => ev.taskId !== id);
        removeFavorites(db, removed);
        await db.write();
        res.json({ success: true });
    });

    app.post('/tasks/:id/duplicate', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const orig = db.data.tasks.find(t => t.id === id);
        if (!orig) return res.status(404).json({ error: 'task not found' });
        const copy = { ...orig, id: uuidv4(), createdAt: new Date().toISOString() };
        db.data.tasks.push(copy);
        db.data.events.push(...generateEvents(copy));
        await db.write();
        res.json(copy);
    });
};
