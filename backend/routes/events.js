const { normalizeDate } = require('./utils');
const { v4: uuidv4 } = require('uuid');

module.exports = (app, db) => {
    app.get('/events', async (req, res) => {
        await db.read();
        const { taskId } = req.query;
        let events = db.data.events || [];
        if (taskId) events = events.filter(ev => ev.taskId === taskId);
        res.json(events);
    });

    app.post('/events', async (req, res) => {
        const { taskId, date, time, assignedTo, points } = req.body;
        if (!taskId) return res.status(400).json({ error: 'taskId required' });
        await db.read();
        const task = db.data.tasks.find(t => t.id === taskId);
        if (!task) return res.status(404).json({ error: 'task not found' });

        const now = new Date();
        const ev = {
            id: uuidv4(),
            taskId,
            date: normalizeDate(date || now.toISOString().split('T')[0]),
            time: time || now.toISOString().split('T')[1].slice(0,5),
            assignedTo: assignedTo || task.assignedTo,
            state: 'created',
            points: points !== undefined ? points : (task.points || 0)
        };
        db.data.events.push(ev);
        await db.write();
        res.json(ev);
    });

    app.patch('/events/:id', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const ev = db.data.events.find(e => e.id === id);
        if (!ev) return res.status(404).json({ error: 'event not found' });

        const { taskId, date, time, state, assignedTo } = req.body;
        if (taskId !== undefined) ev.taskId = taskId;
        if (date !== undefined) {
            try {
                ev.date = normalizeDate(date);
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        if (time !== undefined) ev.time = time;
        if (assignedTo !== undefined) ev.assignedTo = assignedTo;
        if (state !== undefined) ev.state = state;
        await db.write();
        res.json(ev);
    });
};
