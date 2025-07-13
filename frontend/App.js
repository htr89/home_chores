import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TextInput, Button} from 'react-native';
import { IconButton } from 'react-native-paper';
import Tile from './Tile';
import { TASK_COLOR, USER_COLOR } from './colors';
import NavigationBar from './NavigationBar';
import CalendarPage from './CalendarPage';
import TaskForm from './TaskForm';
import EventsPage from './EventsPage';
import LoginPage from './LoginPage';

function TaskList({navigate}) {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});

    const load = async () => {
        const res = await fetch('http://localhost:3000/tasks');
        const data = await res.json();
        setTasks(data);
        const resUsers = await fetch('http://localhost:3000/users');
        const userData = await resUsers.json();
        const map = {};
        userData.forEach(u => { map[u.id] = u.name; });
        setUsers(map);
    };

    useEffect(() => { load(); }, []);

    const handleDuplicate = async (id) => {
        await fetch(`http://localhost:3000/tasks/${id}/duplicate`, {method: 'POST'});
        load();
    };

    const handleDelete = async (id) => {
        await fetch(`http://localhost:3000/tasks/${id}`, {method: 'DELETE'});
        load();
    };

    const renderItem = ({item}) => (
        <TaskRow
            item={item}
            users={users}
            onEdit={task => navigate('edit', task)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            navigate={navigate}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task List</Text>
            <FlatList
                data={tasks}
                keyExtractor={(t) => t.id}
                renderItem={renderItem}
            />
        </View>
    );
}

function TaskRow({item, users, onEdit, onDuplicate, onDelete, navigate}) {
    const actions = (
        <>
            <IconButton icon="pencil" onPress={() => onEdit(item)} />
            <IconButton icon="content-copy" onPress={() => onDuplicate(item.id)} />
            <IconButton icon="calendar" onPress={() => navigate('events', item)} />
            <IconButton icon="delete" onPress={() => onDelete(item.id)} />
        </>
    );
    return (
        <Tile
            title={item.name}
            subtitle={`${users[item.assignedTo] || item.assignedTo} • due ${item.dueDate} • ${item.points} pts`}
            actions={actions}
            color={TASK_COLOR}
        />
    );
}


function UsersPage({navigate}) {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const load = async () => {
        const res = await fetch('http://localhost:3000/users');
        const data = await res.json();
        setUsers(data);
    };
    useEffect(() => { load(); }, []);
    const handleAdd = async () => {
        await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        });
        setName('');
        load();
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Users</Text>
            <FlatList
                data={users}
                keyExtractor={(u) => u.id}
                renderItem={({item}) => (
                    <Tile
                        title={item.name}
                        subtitle={`${item.totalScore} pts - ${item.completedTasks} events`}
                        color={USER_COLOR}
                    />
                )}
            />
            <TextInput
                placeholder="User name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <Button title="Add User" onPress={handleAdd} />
        </View>
    );
}

export default function App() {
    const [page, setPage] = useState('create');
    const [navOpen, setNavOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [eventsTask, setEventsTask] = useState(null);
    const [user, setUser] = useState(null);
    const [checkingLogin, setCheckingLogin] = useState(true);

    useEffect(() => {
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('login') : null;
        if (!saved) { setCheckingLogin(false); return; }
        const {name, password} = JSON.parse(saved);
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({name, password})
        })
            .then(res => res.ok ? res.json() : null)
            .then(u => { setUser(u); setCheckingLogin(false); })
            .catch(() => setCheckingLogin(false));
    }, []);

    const navigate = (to, param) => {
        if (to === 'edit') setEditingTask(param);
        if (to === 'events') setEventsTask(param);
        setPage(to);
    };

    if (checkingLogin) {
        return <View style={styles.app}/>;
    }

    if (!user) {
        return <LoginPage onLogin={setUser}/>;
    }

    return (
        <View style={styles.app}>
            <NavigationBar navigate={navigate} open={navOpen} setOpen={setNavOpen} />
            {page === 'create' ? (
                <TaskForm navigate={navigate} />
            ) : page === 'edit' ? (
                <TaskForm task={editingTask} navigate={navigate} />
            ) : page === 'users' ? (
                <UsersPage navigate={navigate}/>
            ) : page === 'calendar' ? (
                <CalendarPage />
            ) : page === 'events' ? (
                <EventsPage task={eventsTask} navigate={navigate}/>
            ) : (
                <TaskList navigate={navigate}/>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    app: {flex: 1, flexDirection: 'row'},
    container: {flex: 1, padding: 20},
    title: {fontSize: 24, marginBottom: 16},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        padding: 8,
        borderRadius: 4,
    },
});
