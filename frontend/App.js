import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {DatePickerInput, TimePickerModal} from 'react-native-paper-dates';
import NavigationBar from './NavigationBar';
import CalendarPage from './CalendarPage';

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
        <TaskRow item={item} users={users} refresh={load} />
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

function TaskRow({item, users, refresh}) {
    const [expanded, setExpanded] = useState(false);
    const [name, setName] = useState(item.name);
    const [assignedTo, setAssignedTo] = useState(item.assignedTo);
    const [dueDate, setDueDate] = useState(item.dueDate);
    const [points, setPoints] = useState(String(item.points));
    const [repetition, setRepetition] = useState(item.repetition || 'none');
    const [endDate, setEndDate] = useState(item.endDate || item.dueDate);

    const handleSave = async () => {
        await fetch(`http://localhost:3000/tasks/${item.id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, assignedTo, dueDate, points, repetition, endDate})
        });
        setExpanded(false);
        refresh();
    };

    return (
        <View style={styles.item}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                <Text>{item.name} - {users[item.assignedTo] || item.assignedTo}</Text>
                <Text style={styles.itemSecondary}>due {item.dueDate} - {item.points} points</Text>
            </TouchableOpacity>
            {expanded && (
                <View>
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
                        {Object.entries(users).map(([id, uName]) => (
                            <Picker.Item key={id} label={uName} value={id} />
                        ))}
                    </Picker>
                    <TextInput
                        placeholder="Due date (YYYY-MM-DD)"
                        value={dueDate}
                        onChangeText={setDueDate}
                        style={styles.input}
                    />
                    <Picker
                        selectedValue={repetition}
                        onValueChange={setRepetition}
                        style={styles.input}
                    >
                        <Picker.Item label="No repeat" value="none" />
                        <Picker.Item label="Weekly" value="weekly" />
                        <Picker.Item label="Monthly" value="monthly" />
                        <Picker.Item label="Yearly" value="yearly" />
                    </Picker>
                    <TextInput
                        placeholder="End date (YYYY-MM-DD)"
                        value={endDate}
                        onChangeText={setEndDate}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Points"
                        value={points}
                        onChangeText={setPoints}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Button title="Save" onPress={handleSave} />
                </View>
            )}
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
    const formatDate = (d) => d.toISOString().split('T')[0];
    const formatTime = (d) => d.toTimeString().slice(0,5);
    const [dueDate, setDueDate] = useState(formatDate(new Date()));
    const [dueTime, setDueTime] = useState(formatTime(new Date()));
    const [timeVisible, setTimeVisible] = useState(false);
    const [points, setPoints] = useState('');
    const [repetition, setRepetition] = useState('none');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (repetition === 'none') { setEndDate(''); return; }
        const d = new Date(dueDate);
        if (repetition === 'weekly') d.setMonth(d.getMonth() + 1);
        if (repetition === 'monthly') d.setFullYear(d.getFullYear() + 1);
        if (repetition === 'yearly') d.setFullYear(d.getFullYear() + 5);
        setEndDate(formatDate(d));
    }, [dueDate, repetition]);

    const handleSubmit = async () => {
        const dueDateTime = `${dueDate}T${dueTime}`;
        const data = {name, assignedTo, dueDate: dueDateTime, points, repetition, endDate};
        await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        setName('');
        setAssignedTo(users[0] ? users[0].id : '');
        setDueDate(formatDate(new Date()));
        setDueTime(formatTime(new Date()));
        setPoints('');
        setRepetition('none');
        setEndDate('');
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
            <DatePickerInput
                locale="en"
                label="Due date"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={d => d && setDueDate(formatDate(d))}
                inputMode="start"
                inputEnabled
                style={styles.input}
            />
            <Button title={`Time: ${dueTime}`} onPress={() => setTimeVisible(true)} />
            <TimePickerModal
                visible={timeVisible}
                onDismiss={() => setTimeVisible(false)}
                onConfirm={({hours, minutes}) => {
                    setTimeVisible(false);
                    const hh = String(hours).padStart(2, '0');
                    const mm = String(minutes).padStart(2, '0');
                    setDueTime(`${hh}:${mm}`);
                }}
                hours={parseInt(dueTime.split(':')[0], 10)}
                minutes={parseInt(dueTime.split(':')[1], 10)}
            />
            <Picker
                selectedValue={repetition}
                onValueChange={setRepetition}
                style={styles.input}
            >
                <Picker.Item label="No repeat" value="none" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
                <Picker.Item label="Yearly" value="yearly" />
            </Picker>
            {repetition !== 'none' && (
                <DatePickerInput
                    locale="en"
                    label="End date"
                    value={endDate ? new Date(endDate) : undefined}
                    onChange={d => d && setEndDate(formatDate(d))}
                    inputMode="start"
                    inputEnabled
                    style={styles.input}
                />
            )}
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
    const [navOpen, setNavOpen] = useState(false);
    const navigate = (to) => setPage(to);

    return (
        <View style={styles.app}>
            <NavigationBar navigate={navigate} open={navOpen} setOpen={setNavOpen} />
            {page === 'create' ? (
                <TaskCreate navigate={navigate}/>
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
