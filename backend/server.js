const express = require('express');
const cors = require('cors');
const path = require('path');
const migrate = require('./scripts/migrate');

const app = express();

(async () => {
    const { Low }   = await import('lowdb');         // nur Low kommt aus 'lowdb'
    const { JSONFile } = await import('lowdb/node'); // der Adapter kommt aus 'lowdb/node'

    const dbFile  = path.join(__dirname, 'db.json');
    const adapter = new JSONFile(dbFile);
    const defaultUser = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'System User',
        password: 'password',
        totalScore: 0,
        completedTasks: 0,
        favorites: [],
        config: {
            workingHoursStart: '07:00',
            workingHoursEnd: '22:00'
        }
    };
    const defaultData = {
        migrationVersion: 7,
        users: [defaultUser],
        tasks: [
            {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Test Task',
                assignedTo: defaultUser.id,
                dueDate: new Date().toISOString().split('T')[0],
                points: 0,
                createdAt: new Date().toISOString(),
                repetition: 'none',
                endDate: new Date().toISOString().split('T')[0]
            }
        ],
        events: [],
        steps: [],
        globalConfigurations: {
            workingHoursStart: '07:00',
            workingHoursEnd: '22:00'
        }
    };
    const db      = new Low(adapter, defaultData);

    await db.read();
    db.data ||= { tasks: [], users: [], events: [], steps: [] };
    await migrate(db);
    if (!Array.isArray(db.data.events)) db.data.events = [];
    if (db.data.events.length === 0) {
        const { v4: uuidv4 } = require('uuid');
        const generateEvents = (task) => {
            const events = [];
            let current = new Date(task.dueDate);
            const end = new Date(task.endDate || task.dueDate);
            const time = (task.createdAt || new Date().toISOString()).split('T')[1].slice(0,5);
            while (current <= end) {
                events.push({
                    id: uuidv4(),
                    taskId: task.id,
                    date: `${current.toISOString().split('T')[0]}T${time}`,
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
        };
        db.data.tasks.forEach(t => {
            db.data.events.push(...generateEvents(t));
        });
    }
    await db.write();

    // Move past events to today on startup
    async function reschedulePastEvents() {
        await db.read();
        const today = new Date().toISOString().split('T')[0];
        const startToday = new Date(`${today}T00:00`);
        db.data.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        db.data.events.forEach(ev => {
            if (new Date(ev.date) < startToday && ev.state !== 'completed') {
                const timePart = ev.date.includes('T') ? ev.date.split('T')[1] : '00:00';
                ev.date = `${today}T${timePart}`;
                ev.state = 'delayed';
            }
        });
        await db.write();
    }

    await reschedulePastEvents();
    setInterval(reschedulePastEvents, 60 * 60 * 1000);

    app.use(cors());
    app.use(express.json());
    require('./routes')(app, db);

    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})();

module.exports = app;
