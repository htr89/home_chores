import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList, StyleSheet} from 'react-native';

function TaskList({navigate}) {
    const [tasks, setTasks] = useState([]);
    useEffect(() => {
        const load = async () => {
            const res = await fetch('http://localhost:3000/tasks');
            const data = await res.json();
            setTasks(data);
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
                        <Text>{item.name} - {item.assignedTo}</Text>
                        <Text style={styles.itemSecondary}>due {item.dueDate} - {item.points} points</Text>
                    </View>
                )}
            />
            <Button title="Create Task" onPress={() => navigate('create')}/>
        </View>
    );
}

function TaskCreate({navigate}) {
    const [name, setName] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
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
        setAssignedTo('');
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
            <TextInput
                placeholder="Assigned to"
                value={assignedTo}
                onChangeText={setAssignedTo}
                style={styles.input}
            />
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
            <View style={{height: 10}}/>
            <Button title="Task List" onPress={() => navigate('list')}/>
        </View>
    );
}

export default function App() {
    const [page, setPage] = useState('create');
    const navigate = (to) => setPage(to);

    return (
        <View style={styles.app}>
            {page === 'create' ? (
                <TaskCreate navigate={navigate}/>
            ) : (
                <TaskList navigate={navigate}/>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    app: {flex: 1, padding: 20, paddingTop: 50},
    container: {flex: 1},
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
