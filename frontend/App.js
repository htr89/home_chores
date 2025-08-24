import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Provider as PaperProvider, MD3LightTheme} from 'react-native-paper';
import NavigationBar from './components/NavigationBar';
import CalendarPage from './pages/CalendarPage';
import TaskForm from './forms/TaskForm';
import EventsPage from './pages/EventsPage';
import EventForm from './forms/EventForm';
import UserForm from './forms/UserForm';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import TaskPage from './pages/TaskPage';
import UserPage from './pages/UserPage';
import API_URL from './api';

const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#6750A4',
        secondary: '#625b71',
        tertiary: '#7D5260',
    },
};

export default function App() {
    const [page, setPage] = useState('dashboard');
    const [navOpen, setNavOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [eventsTask, setEventsTask] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [eventOrigin, setEventOrigin] = useState(null);
    const [user, setUser] = useState(null);
    const [globalConfig, setGlobalConfig] = useState({ workingHoursStart: '06:00', workingHoursEnd: '22:00' });
    const [checkingLogin, setCheckingLogin] = useState(true);
    const [navigationGuard, setNavigationGuard] = useState(null);

    useEffect(() => {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('login') : null;
        if (!saved) { setCheckingLogin(false); return; }
        const {name, password} = JSON.parse(saved);
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name, password})
        })
            .then(res => res.ok ? res.json() : null)
            .then(u => { setUser(u); setCheckingLogin(false); })
            .catch(() => setCheckingLogin(false));
    }, []);

    useEffect(() => {
        if (!user) return;
        fetch(`${API_URL}/config`)
            .then(res => res.json())
            .then(setGlobalConfig)
            .catch(() => {});
    }, [user]);

    const navigate = (to, param) => {
        if (navigationGuard && !navigationGuard()) return;
        if (to === 'edit') setEditingTask(param);
        if (to === 'events') setEventsTask(param);
        if (to === 'event-edit') { setEditingEvent(param.event); setEventOrigin(param.origin); }
        if (to === 'user-edit') setEditingUser(param);
        if (to === 'user-create') setEditingUser(null);
        setPage(to);
    };

    const handleLogout = () => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('login');
        }
        setUser(null);
        setNavOpen(false);
    };

    const renderContent = () => {
        if (checkingLogin) {
            return <View style={styles.app}/>;
        }

        if (!user) {
            return <LoginPage onLogin={setUser}/>;
        }

        return (
            <View style={styles.app}>
                <NavigationBar
                    navigate={navigate}
                    open={navOpen}
                    setOpen={setNavOpen}
                    onLogout={handleLogout}
                />
                {page === 'dashboard' ? (
                    <DashboardPage user={user} setUser={setUser} navigate={navigate} />
                ) : page === 'create' ? (
                    <TaskForm navigate={navigate} />
                ) : page === 'edit' ? (
                    <TaskForm task={editingTask} navigate={navigate} />
                ) : page === 'users' ? (
                    <UserPage navigate={navigate}/>
                ) : page === 'user-create' ? (
                    <UserForm navigateBack={() => navigate('users')} />
                ) : page === 'user-edit' ? (
                    <UserForm user={editingUser} navigateBack={() => navigate('users')} />
                ) : page === 'calendar' ? (
                    <CalendarPage navigate={navigate} user={user} globalConfig={globalConfig} />
                ) : page === 'settings' ? (
                    <SettingsPage user={user} setUser={setUser} navigate={navigate} />
                ) : page === 'events' ? (
                    <EventsPage task={eventsTask} navigate={navigate} setNavigationGuard={setNavigationGuard} user={user} setUser={setUser}/>
                ) : page === 'event-edit' ? (
                    <EventForm event={editingEvent} navigateBack={() => navigate(eventOrigin, eventsTask)} />
                ) : (
                    <TaskPage navigate={navigate}/>
                )}
            </View>
        );
    };

    return (
        <PaperProvider theme={theme}>
            {renderContent()}
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    app: {flex: 1, flexDirection: 'row'},
});
