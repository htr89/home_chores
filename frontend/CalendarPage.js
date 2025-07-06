import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

function weekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day); // Sunday start
    return start.toISOString().split('T')[0];
}

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);
    const [view, setView] = useState('day');

    useEffect(() => {
        const load = async () => {
            const res = await fetch('http://localhost:3000/tasks');
            const data = await res.json();
            setTasks(data);
        };
        load();
    }, []);

    const grouped = useMemo(() => {
        const groups = {};
        tasks.forEach(t => {
            const due = t.dueDate || '';
            let key = due;
            if (view === 'week') {
                key = weekStart(due);
            } else if (view === 'month') {
                key = due.slice(0, 7); // YYYY-MM
            }
            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [tasks, view]);

    return (
        <View style={styles.container}>
            <View style={styles.switcher}>
                <Button title="Day" onPress={() => setView('day')} />
                <Button title="Week" onPress={() => setView('week')} />
                <Button title="Month" onPress={() => setView('month')} />
            </View>
            <FlatList
                data={grouped}
                keyExtractor={([k]) => k}
                renderItem={({ item: [k, items] }) => (
                    <View style={styles.group}>
                        <Text style={styles.groupTitle}>{k}</Text>
                        {items.map(task => (
                            <Text key={task.id} style={styles.task}>{task.name} (due {task.dueDate})</Text>
                        ))}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingLeft: 20 },
    switcher: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
    group: { marginBottom: 12 },
    groupTitle: { fontSize: 18, fontWeight: 'bold' },
    task: { paddingLeft: 10 }
});
