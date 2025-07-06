# home_chores

Deal with your own chores with a point based system.

The project now uses [React Native](https://reactnative.dev/) so the UI can run on mobile devices.  A small Express backend is still included to store tasks in a local JSON file.  The code is organized under `frontend/` and `backend/`.

## Getting Started

Install dependencies (requires Node.js and npm):

```bash
npm install
```

If you see errors about `ViewPropTypes` being undefined when running the web
version, make sure the optional `deprecated-react-native-prop-types` package is
installed. It is included in `package.json` and used as a polyfill in
`frontend/index.js`.

To run the application:

```bash
npm start
```

The `npm start` command launches the React Native development server via [Expo](https://expo.dev/).  In a separate terminal you should run the backend server:

```bash
node backend/server.js
```

The backend listens on `http://localhost:3000` to store tasks in a local JSON file.  You can open the Expo URL on your mobile device to interact with the app.

### Loading sample tasks

A small list of example tasks is available under `backend/test_tasks.json`. These
are **not** loaded automatically. If you want to populate the database with them
run:

```bash
node backend/add_test_tasks.js
```

This script reads the JSON file and appends the tasks to `backend/db.json`.
