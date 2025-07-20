const { normalizeDateTime } = require('./utils');
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
        let dateTime;
        try {
            dateTime = normalizeDateTime(date || now.toISOString(), time);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
        const ev = {
            id: uuidv4(),
            taskId,
            date: dateTime,
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
        if (date !== undefined || time !== undefined) {
            try {
                const dt = normalizeDateTime(date || ev.date, time || ev.date.split('T')[1]);
                ev.date = dt;
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        }
        if (assignedTo !== undefined) ev.assignedTo = assignedTo;
        if (state !== undefined) ev.state = state;
        await db.write();
        res.json(ev);
    });

    app.delete('/events/:id', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const idx = db.data.events.findIndex(e => e.id === id);
        if (idx === -1) return res.status(404).json({ error: 'event not found' });
        db.data.events.splice(idx, 1);
        await db.write();
        res.json({ success: true });
    });
};
