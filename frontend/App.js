import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Button} from 'react-native';
import NavigationBar from './NavigationBar';
import CalendarPage from './CalendarPage';
import TaskForm from './TaskForm';

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

    const renderItem = ({item}) => (
        <TaskRow item={item} users={users} onEdit={task => navigate('edit', task)} />
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

function TaskRow({item, users, onEdit}) {
    return (
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.item}>
            <Text>{item.name} - {users[item.assignedTo] || item.assignedTo}</Text>
            <Text style={styles.itemSecondary}>due {item.dueDate} - {item.points} points</Text>
        </TouchableOpacity>
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
                    <Text>{item.name} - {item.totalPoints} pts - {item.completedTasks} tasks</Text>
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
    const navigate = (to, param) => {
        if (to === 'edit') setEditingTask(param);
        setPage(to);
    };

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
    item: {paddingVertical: 4},
    itemSecondary: {color: '#666'},
});
