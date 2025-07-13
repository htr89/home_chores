module.exports = (app, db) => {
    // Am Kopf Ihrer Datei (oder in einem separaten utils-Modul)
    const {parse, format} = require('date-fns');

    /**
     * Nimmt ein Datum als String entgegen und gibt einen ISO-Date-String YYYY-MM-DD zurück.
     * Unterstützt Eingaben in den Formaten "YYYY-MM-DD" und "D.M.YYYY" bzw. "DD.MM.YYYY".
     */
    function normalizeDate(input) {
        if (!input) return null;
        // Europäisches Format: 1.7.2025 oder 11.07.2025
        if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(input)) {
            const date = parse(input, 'd.M.yyyy', new Date());
            return format(date, 'yyyy-MM-dd');
        }
        // Sonst versuchen wir, das Datum direkt zu parsen
        const date = new Date(input);
        if (isNaN(date)) {
            throw new Error(`Ungültiges Datum: ${input}`);
        }
        return format(date, 'yyyy-MM-dd');
    }

    const {v4: uuidv4} = require('uuid');

    app.get('/tasks', async (req, res) => {
        await db.read();
        res.json(db.data.tasks);
    });

    app.get('/users', async (req, res) => {
        await db.read();
        const users = db.data.users.map(u => ({...u}));
        users.forEach(u => {
            const events = (db.data.events || []).filter(ev => ev.assignedTo === u.id && ev.state === 'completed');
            u.completedTasks = events.length;
            u.totalScore = events.reduce((sum, ev) => sum + (ev.points || 0), 0);
        });
        res.json(users);
    });

    app.get('/config', async (req, res) => {
        await db.read();
        db.data.globalConfigurations = db.data.globalConfigurations || {
            workingHoursStart: '06:00',
            workingHoursEnd: '22:00'
        };
        res.json(db.data.globalConfigurations);
    });

    app.patch('/config', async (req, res) => {
        const { workingHoursStart, workingHoursEnd } = req.body;
        await db.read();
        db.data.globalConfigurations = db.data.globalConfigurations || {
            workingHoursStart: '06:00',
            workingHoursEnd: '22:00'
        };
        if (workingHoursStart !== undefined)
            db.data.globalConfigurations.workingHoursStart = workingHoursStart;
        if (workingHoursEnd !== undefined)
            db.data.globalConfigurations.workingHoursEnd = workingHoursEnd;
        await db.write();
        res.json(db.data.globalConfigurations);
    });

    function generateEvents(task) {
        const events = [];
        let current = new Date(task.dueDate);
        const end = new Date(task.endDate || task.dueDate);
        const time = (task.createdAt || new Date().toISOString()).split('T')[1].slice(0, 5);
        while (current <= end) {
            events.push({
                id: uuidv4(),
                taskId: task.id,
                date: current.toISOString().split('T')[0],
                time,
                assignedTo: task.assignedTo,
                state: 'created',
                points: task.points || 0
            });
            if (task.repetition === 'weekly') {
                current.setDate(current.getDate() + 7);
            } else if (task.repetition === 'monthly') {
                current.setMonth(current.getMonth() + 1);
            } else if (task.repetition === 'yearly') {
                current.setFullYear(current.getFullYear() + 1);
            } else {
                break;
            }
        }
        return events;
    }

    app.get('/events', async (req, res) => {
        await db.read();
        const {taskId} = req.query;
        let events = db.data.events || [];
        if (taskId) events = events.filter(ev => ev.taskId === taskId);
        res.json(events);
    });

    app.post('/tasks', async (req, res) => {
        let {name, assignedTo, dueDate, points, repetition, endDate, steps} = req.body;
        if (!name) return res.status(400).json({error: 'name required'});
        try {
            dueDate = normalizeDate(dueDate);
            endDate = endDate ? normalizeDate(endDate) : dueDate;
        } catch (err) {
            return res.status(400).json({error: err.message});
        }
        const task = {
            id: uuidv4(),
            name,
            assignedTo,
            dueDate,
            points: Number(points) || 0,
            createdAt: new Date().toISOString(),
            repetition: repetition || 'none',
            endDate
        };
        await db.read();
        db.data.tasks.push(task);
        db.data.events.push(...generateEvents(task));
        if (Array.isArray(steps)) {
            steps.forEach(text => {
                db.data.steps.push({ id: uuidv4(), taskId: task.id, text });
            });
        }
        await db.write();
        res.json(task);
    });

    // Update an existing task
    app.patch('/tasks/:id', async (req, res) => {
        const {id} = req.params;
        await db.read();
        const task = db.data.tasks.find(t => t.id === id);
        if (!task) return res.status(404).json({error: 'task not found'});

        let {name, assignedTo, dueDate, points, repetition, endDate} = req.body;
        if (name !== undefined) task.name = name;
        if (assignedTo !== undefined) task.assignedTo = assignedTo;
        if (dueDate !== undefined) {
            try {
                task.dueDate = normalizeDate(dueDate);
            } catch (err) {
                return res.status(400).json({error: err.message});
            }
        }
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (points !== undefined) task.points = Number(points) || 0;
        if (repetition !== undefined) task.repetition = repetition;
        if (endDate !== undefined) {
            try {
                task.endDate = normalizeDate(endDate);
            } catch (err) {
                return res.status(400).json({error: err.message});
            }
        }
        if (endDate !== undefined) task.endDate = endDate;

        // regenerate events for this task
        db.data.events = db.data.events.filter(e => e.taskId !== id);
        db.data.events.push(...generateEvents(task));

        await db.write();
        res.json(task);
    });

    // Delete a task and its events
    app.delete('/tasks/:id', async (req, res) => {
        const {id} = req.params;
        await db.read();
        const idx = db.data.tasks.findIndex(t => t.id === id);
        if (idx === -1) return res.status(404).json({error: 'task not found'});
        db.data.tasks.splice(idx, 1);
        db.data.events = db.data.events.filter(ev => ev.taskId !== id);
        await db.write();
        res.json({success: true});
    });

    // Duplicate a task and immediately generate its events
    app.post('/tasks/:id/duplicate', async (req, res) => {
        const {id} = req.params;
        await db.read();
        const orig = db.data.tasks.find(t => t.id === id);
        if (!orig) return res.status(404).json({error: 'task not found'});
        const copy = {...orig, id: uuidv4(), createdAt: new Date().toISOString()};
        db.data.tasks.push(copy);
        db.data.events.push(...generateEvents(copy));
        await db.write();
        res.json(copy);
    });

    // Steps endpoints
    app.get('/steps', async (req, res) => {
        await db.read();
        const {taskId} = req.query;
        let steps = db.data.steps || [];
        if (taskId) steps = steps.filter(s => s.taskId === taskId);
        res.json(steps);
    });

    app.post('/steps', async (req, res) => {
        const {taskId, text} = req.body;
        if (!taskId || !text) return res.status(400).json({error: 'taskId and text required'});
        const step = { id: uuidv4(), taskId, text };
        await db.read();
        db.data.steps.push(step);
        await db.write();
        res.json(step);
    });

    app.delete('/steps/:id', async (req, res) => {
        const {id} = req.params;
        await db.read();
        const idx = db.data.steps.findIndex(s => s.id === id);
        if (idx === -1) return res.status(404).json({error: 'step not found'});
        db.data.steps.splice(idx, 1);
        await db.write();
        res.json({success: true});
    });

    // Update an event
    app.patch('/events/:id', async (req, res) => {
        const {id} = req.params;
        await db.read();
        const ev = db.data.events.find(e => e.id === id);
        if (!ev) return res.status(404).json({error: 'event not found'});

        let {taskId, date, time, state, assignedTo} = req.body;
        if (taskId !== undefined) ev.taskId = taskId;
        if (date !== undefined) {
            try {
                ev.date = normalizeDate(date);
            } catch (err) {
                return res.status(400).json({error: err.message});
            }
        }
        if (time !== undefined) ev.time = time;
        if (assignedTo !== undefined) ev.assignedTo = assignedTo;
        if (state !== undefined) {
            ev.state = state;
        }
        await db.write();
        res.json(ev);
    });

    app.post('/users', async (req, res) => {
        const {name, password} = req.body;
        if (!name) return res.status(400).json({error: 'name required'});
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
        const {password: pw, ...safeUser} = user;
        res.json(safeUser);
    });

    app.patch('/users/:id/config', async (req, res) => {
        const { id } = req.params;
        const { workingHoursStart, workingHoursEnd } = req.body;
        await db.read();
        const user = db.data.users.find(u => u.id === id);
        if (!user) return res.status(404).json({error: 'user not found'});
        user.config = user.config || {};
        if (workingHoursStart !== undefined) user.config.workingHoursStart = workingHoursStart;
        if (workingHoursEnd !== undefined) user.config.workingHoursEnd = workingHoursEnd;
        await db.write();
        const { password: pw, ...safeUser } = user;
        res.json(safeUser);
    });

    app.post('/login', async (req, res) => {
        const {name, password} = req.body;
        await db.read();
        const user = db.data.users.find(u => u.name === name && u.password === password);
        if (!user) return res.status(401).json({error: 'invalid credentials'});
        const {password: pw, ...safeUser} = user;
        res.json(safeUser);
    });
};
