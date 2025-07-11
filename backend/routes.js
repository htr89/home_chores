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
        res.json(db.data.users);
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
                time
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
        res.json(db.data.events || []);
    });

    app.post('/tasks', async (req, res) => {
        let {name, assignedTo, dueDate, points, repetition, endDate} = req.body;
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

    app.post('/users', async (req, res) => {
        const {name} = req.body;
        if (!name) return res.status(400).json({error: 'name required'});
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
