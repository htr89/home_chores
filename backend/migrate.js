const CURRENT_VERSION = 2;

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

  if (db.data.migrationVersion < 2) {
    db.data.users = db.data.users || [];
    db.data.users.forEach(u => {
      if (u.totalPoints !== undefined && u.totalScore === undefined) {
        u.totalScore = u.totalPoints;
        delete u.totalPoints;
      }
      if (u.password === undefined) {
        u.password = 'password';
      }
      if (u.completedTasks === undefined) {
        u.completedTasks = 0;
      }
      if (u.totalScore === undefined) {
        u.totalScore = 0;
      }
    });
    db.data.migrationVersion = 2;
    await db.write();
  }
};
