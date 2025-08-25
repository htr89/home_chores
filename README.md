# home_chores

Deal with your own chores with a point based system.

Tasks can repeat weekly, monthly or yearly. When a task is created the server
generates corresponding **events** for all occurrences until the optional end
date. The calendar view displays these events rather than the raw tasks.

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

To start the backend server:

```bash
npm start
```

This command launches the Express server. By default it listens on port 3000 but will respect the `PORT` environment variable when provided (as Railway does).

To run the React Native frontend for development:

```bash
npm run dev
```

The Expo server URL can be opened on your mobile device to interact with the app.

When the server starts it immediately checks for events whose date lies in the past.
Such events are moved to the current day and marked with the state `delayed`.
This check is repeated automatically every hour while the server is running.

### Deploying on Railway

Railway runs `npm start` by default and supplies the `PORT` environment variable.
Attach a persistent volume so `backend/db.json` is not lost between restarts.
Run `npm run build` during deployment to produce static web assets under `dist/`. The
Express server automatically serves this directory so visiting the Railway URL
will load the frontend. Set the `EXPO_PUBLIC_API_URL` environment variable in the
frontend when developing locally to point at the deployed backend.

### Loading sample tasks

A small list of example tasks is available under `backend/data/test_tasks.json`. These
are **not** loaded automatically. If you want to populate the database with them
run:

```bash
node backend/scripts/add_test_tasks.js
```

This script reads the JSON file and appends the tasks to `backend/db.json`.

### Login

Users must authenticate with a simple username/password pair.  New users are
created with the default password `password`.  On first launch you will be asked
to log in and can choose to remember the credentials for automatic sign in on
subsequent launches.

### Settings

Click the user icon in the navigation bar to access the settings page.  Each
user can configure their personal working hours which control the time range
displayed in the calendar view.  By default only the hours between 06:00 and
22:00 are shown.
