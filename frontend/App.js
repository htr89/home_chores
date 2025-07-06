import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import NavigationBar from './NavigationBar';

function TaskList({navigate}) {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState({});
    useEffect(() => {
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
        console.log('🚀 App mounted, loading tasks…');
        load();
    }, []);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task List</Text>
            <FlatList
                data={tasks}
                keyExtractor={(t) => t.id}
                renderItem={({item}) => (
                    <View style={styles.item}>
                        <Text>{item.name} - {users[item.assignedTo] || item.assignedTo}</Text>
                        <Text style={styles.itemSecondary}>due {item.dueDate} - {item.points} points</Text>
                    </View>
                )}
            />
            {/* Navigation handled by NavigationBar */}
        </View>
    );
}

function TaskCreate({navigate}) {
    const [name, setName] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const load = async () => {
            const res = await fetch('http://localhost:3000/users');
            const data = await res.json();
            setUsers(data);
            if (data.length > 0) setAssignedTo(data[0].id);
        };
        load();
    }, []);
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState('');

    const handleSubmit = async () => {
        const data = {name, assignedTo, dueDate, points};
        await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        setName('');
        setAssignedTo(users[0] ? users[0].id : '');
        setDueDate('');
        setPoints('');
        navigate('list');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Task</Text>
            <TextInput
                placeholder="Task name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <Picker
                selectedValue={assignedTo}
                onValueChange={setAssignedTo}
                style={styles.input}
            >
                {users.map(u => (
                    <Picker.Item key={u.id} label={u.name} value={u.id} />
                ))}
            </Picker>
            <TextInput
                placeholder="Due date (YYYY-MM-DD)"
                value={dueDate}
                onChangeText={setDueDate}
                style={styles.input}
            />
            <TextInput
                placeholder="Points"
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
                style={styles.input}
            />
            <Button title="Add Task" onPress={handleSubmit}/>
        </View>
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
    const navigate = (to) => setPage(to);

    return (
        <View style={styles.app}>
            <NavigationBar navigate={navigate} />
            {page === 'create' ? (
                <TaskCreate navigate={navigate}/>
            ) : page === 'users' ? (
                <UsersPage navigate={navigate}/>
            ) : (
                <TaskList navigate={navigate}/>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    app: {flex: 1, flexDirection: 'row', padding: 20, paddingTop: 50},
    container: {flex: 1, paddingLeft: 20},
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
