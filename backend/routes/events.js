const { normalizeDate } = require('./utils');

module.exports = (app, db) => {
    app.get('/events', async (req, res) => {
        await db.read();
        const { taskId } = req.query;
        let events = db.data.events || [];
        if (taskId) events = events.filter(ev => ev.taskId === taskId);
        res.json(events);
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
