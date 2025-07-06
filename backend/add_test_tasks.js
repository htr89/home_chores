const fs = require('fs');
const path = require('path');

(async () => {
  const { Low } = await import('lowdb');
  const { JSONFile } = await import('lowdb/node');
  const { v4: uuidv4 } = require('uuid');

  const dbFile = path.join(__dirname, 'db.json');
  const adapter = new JSONFile(dbFile);
  const db = new Low(adapter);
  await db.read();
  db.data ||= { tasks: [], users: [] };

  const tasksPath = path.join(__dirname, 'test_tasks.json');
  const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

  tasks.forEach(t => {
    db.data.tasks.push({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...t
    });
  });

  await db.write();
  console.log(`Added ${tasks.length} test tasks`);
})();
