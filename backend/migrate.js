const CURRENT_VERSION = 1;

module.exports = async function migrate(db) {
  await db.read();
  db.data ||= { tasks: [], users: [], events: [] };
  db.data.migrationVersion ||= 0;

  if (db.data.migrationVersion < 1) {
    // Add time field to events generated before version 1
    db.data.events = db.data.events || [];
    db.data.events.forEach(ev => {
      if (!ev.time) {
        const task = (db.data.tasks || []).find(t => t.id === ev.taskId);
        const ts = task?.createdAt || new Date().toISOString();
        ev.time = ts.split('T')[1].slice(0,5); // HH:MM
      }
    });
    db.data.migrationVersion = 1;
    await db.write();
  }
};
