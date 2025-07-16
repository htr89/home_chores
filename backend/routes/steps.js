const { v4: uuidv4 } = require('uuid');

module.exports = (app, db) => {
    app.get('/steps', async (req, res) => {
        await db.read();
        const { taskId } = req.query;
        let steps = db.data.steps || [];
        if (taskId) steps = steps.filter(s => s.taskId === taskId);
        res.json(steps);
    });

    app.post('/steps', async (req, res) => {
        const { taskId, text } = req.body;
        if (!taskId || !text) return res.status(400).json({ error: 'taskId and text required' });
        const step = { id: uuidv4(), taskId, text };
        await db.read();
        db.data.steps.push(step);
        await db.write();
        res.json(step);
    });

    app.delete('/steps/:id', async (req, res) => {
        const { id } = req.params;
        await db.read();
        const idx = db.data.steps.findIndex(s => s.id === id);
        if (idx === -1) return res.status(404).json({ error: 'step not found' });
        db.data.steps.splice(idx, 1);
        await db.write();
        res.json({ success: true });
    });
};
