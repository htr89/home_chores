const express = require('express');
const path = require('path');

const app = express();

(async () => {
  const { Low, JSONFile } = await import('lowdb');
  const dbFile = path.join(__dirname, 'db.json');
  const adapter = new JSONFile(dbFile);
  const db = new Low(adapter);

  await db.read();
  db.data ||= { tasks: [] };
  await db.write();

  app.use(express.json());

  require('./routes')(app, db);

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})();

module.exports = app;
