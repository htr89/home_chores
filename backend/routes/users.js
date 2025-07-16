const { v4: uuidv4 } = require('uuid');

module.exports = (app, db) => {
    app.get('/users', async (req, res) => {
        await db.read();
        const users = db.data.users.map(u => ({ ...u }));
        users.forEach(u => {
            const events = (db.data.events || []).filter(ev => ev.assignedTo === u.id && ev.state === 'completed');
            u.completedTasks = events.length;
            u.totalScore = events.reduce((sum, ev) => sum + (ev.points || 0), 0);
        });
        res.json(users);
    });

    app.post('/users', async (req, res) => {
        const { name, password } = req.body;
        if (!name) return res.status(400).json({ error: 'name required' });
        const user = {
            id: uuidv4(),
            name,
            password: password || 'password',
            totalScore: 0,
            completedTasks: 0,
            config: {
                workingHoursStart: db.data.globalConfigurations?.workingHoursStart || '06:00',
                workingHoursEnd: db.data.globalConfigurations?.workingHoursEnd || '22:00'
            }
        };
        await db.read();
        db.data.users.push(user);
        await db.write();
        const { password: pw, ...safeUser } = user;
        res.json(safeUser);
    });

    app.patch('/users/:id', async (req, res) => {
        const { id } = req.params;
        const { name, password } = req.body;
        await db.read();
        const user = db.data.users.find(u => u.id === id);
        if (!user) return res.status(404).json({ error: 'user not found' });
        if (name !== undefined) user.name = name;
        if (password !== undefined && password !== '') user.password = password;
        await db.write();
        const { password: pw, ...safeUser } = user;
        res.json(safeUser);
    });

    app.patch('/users/:id/config', async (req, res) => {
        const { id } = req.params;
        const { workingHoursStart, workingHoursEnd } = req.body;
        await db.read();
        const user = db.data.users.find(u => u.id === id);
        if (!user) return res.status(404).json({ error: 'user not found' });
        user.config = user.config || {};
        if (workingHoursStart !== undefined) user.config.workingHoursStart = workingHoursStart;
        if (workingHoursEnd !== undefined) user.config.workingHoursEnd = workingHoursEnd;
        await db.write();
        const { password: pw, ...safeUser } = user;
        res.json(safeUser);
    });
};
