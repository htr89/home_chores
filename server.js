const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

(async () => {
    const { Low }   = await import('lowdb');         // nur Low kommt aus 'lowdb'
    const { JSONFile } = await import('lowdb/node'); // der Adapter kommt aus 'lowdb/node'

    const dbFile  = path.join(__dirname, 'db.json');
    const adapter = new JSONFile(dbFile);
    const defaultData = {
        tasks: [
            {
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Test Task',
                assignedTo: 'System',
                dueDate: new Date().toISOString().split('T')[0],
                points: 0,
                createdAt: new Date().toISOString()
            }
        ]
    };
    const db      = new Low(adapter, defaultData);

    await db.read();
    db.data ||= { tasks: [] };
    await db.write();

    app.use(cors());
    app.use(express.json());
    require('./routes')(app, db);

    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})();

module.exports = app;
