const CURRENT_VERSION = 5;

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

  if (db.data.migrationVersion < 3) {
    db.data.steps = db.data.steps || [];
    db.data.events = db.data.events || [];
    db.data.events.forEach(ev => {
      if (ev.state === undefined) ev.state = 'created';
      if (ev.assignedTo === undefined) {
        const task = (db.data.tasks || []).find(t => t.id === ev.taskId);
        ev.assignedTo = task?.assignedTo;
      }
    });
    db.data.migrationVersion = 3;
    await db.write();
  }

  if (db.data.migrationVersion < 4) {
    db.data.events = db.data.events || [];
    db.data.events.forEach(ev => {
      if (ev.points === undefined) {
        const task = (db.data.tasks || []).find(t => t.id === ev.taskId);
        ev.points = task?.points || 0;
      }
    });
    db.data.migrationVersion = 4;
    await db.write();
  }

  if (db.data.migrationVersion < 5) {
    db.data.globalConfigurations = db.data.globalConfigurations || {
      workingHoursStart: '06:00',
      workingHoursEnd: '22:00',
    };
    db.data.users = db.data.users || [];
    db.data.users.forEach(u => {
      u.config = u.config || {};
      if (!u.config.workingHoursStart)
        u.config.workingHoursStart = db.data.globalConfigurations.workingHoursStart;
      if (!u.config.workingHoursEnd)
        u.config.workingHoursEnd = db.data.globalConfigurations.workingHoursEnd;
    });
    db.data.migrationVersion = 5;
    await db.write();
  }
};
