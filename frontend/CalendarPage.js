import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const load = async () => {
            const res = await fetch('http://localhost:3000/tasks');
            const data = await res.json();
            setTasks(data);
        };
        load();
    }, []);

    const items = useMemo(() => {
        const res = {};
        tasks.forEach(task => {
            if (!task.dueDate) return;
            if (!res[task.dueDate]) res[task.dueDate] = [];
            res[task.dueDate].push(task);
        });
        return res;
    }, [tasks]);

    return (
        <Agenda
            items={items}
            selected={Object.keys(items)[0] || new Date().toISOString().split('T')[0]}
            renderItem={(item) => (
                <View style={styles.item}>
                    <Text>{item.name}</Text>
                </View>
            )}
            renderEmptyData={() => (
                <View style={styles.empty}><Text>No tasks</Text></View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#fff',
        padding: 10,
        marginRight: 10,
        marginTop: 17,
        borderRadius: 5
    },
    empty: { padding: 10 }
});
