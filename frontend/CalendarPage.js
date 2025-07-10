// CalendarPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Button } from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // load events and tasks
    useEffect(() => {
        fetch('http://localhost:3000/events')
            .then(res => res.json())
            .then(setEvents)
            .catch(console.error);
        fetch('http://localhost:3000/tasks')
            .then(res => res.json())
            .then(setTasks)
            .catch(console.error);
    }, []);

    const taskMap = useMemo(() => {
        const map = {};
        tasks.forEach(t => { map[t.id] = t; });
        return map;
    }, [tasks]);

    const itemsByDate = useMemo(() => {
        return events.reduce((acc, ev) => {
            if (!ev.date) return acc;
            acc[ev.date] = acc[ev.date] || [];
            acc[ev.date].push(ev);
            return acc;
        }, {});
    }, [events]);

    const markedDates = useMemo(() => {
        const marks = {};
        Object.entries(itemsByDate).forEach(([date, list]) => {
            if (list.length === 0) return;
            const color = getColor(list.length);
            marks[date] = {
                customStyles: {
                    container: {backgroundColor: color},
                    text: {color: '#000'}
                }
            };
        });
        if (selectedDate) {
            marks[selectedDate] = {
                ...(marks[selectedDate] || {}),
                selected: true
            };
        }
        return marks;
    }, [itemsByDate, selectedDate]);

    const agendaItems = useMemo(() => {
        const obj = {};
        Object.entries(itemsByDate).forEach(([date, list]) => {
            obj[date] = list.map(ev => ({
                ...ev,
                name: taskMap[ev.taskId]?.name || ev.taskId
            }));
        });
        if (selectedDate && !obj[selectedDate]) obj[selectedDate] = [];
        return obj;
    }, [itemsByDate, taskMap, selectedDate]);

    const renderItem = (item) => (
        <View style={styles.agendaItem}>
            <Text>{item.time || ''} - {item.name}</Text>
        </View>
    );

    const agendaComponent = (
        <Agenda
            items={agendaItems}
            selected={selectedDate}
            renderItem={renderItem}
            renderEmptyData={() => (
                <View style={styles.agendaItem}><Text>No events</Text></View>
            )}
        />
    );

    const calendarComponent = (
        <Calendar
            markingType="custom"
            markedDates={markedDates}
            onDayPress={day => setSelectedDate(day.dateString)}
            style={styles.calendar}
        />
    );

    const isWeb = Platform.OS === 'web';

    return (
        <View style={styles.container}>
            {isWeb ? (
                <View style={styles.webLayout}>
                    {selectedDate && (
                        <View style={styles.agendaContainer}>
                            <Button title="Back to calendar" onPress={() => setSelectedDate(null)} />
                            {agendaComponent}
                        </View>
                    )}
                    {calendarComponent}
                </View>
            ) : (
                selectedDate ? (
                    <View style={styles.agendaContainer}>
                        <Button title="Back to calendar" onPress={() => setSelectedDate(null)} />
                        {agendaComponent}
                    </View>
                ) : (
                    calendarComponent
                )
            )}
        </View>
    );
}

function getColor(count) {
    const capped = Math.min(Math.max(count, 0), 10);
    if (capped === 0) return 'transparent';
    const ratio = capped / 10; // 0 -> green, 1 -> red
    const hue = 120 - 120 * ratio; // 120=green, 0=red
    return `hsl(${hue}, 70%, 70%)`;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    webLayout: { flex: 1, flexDirection: 'row' },
    calendar: { alignSelf: 'flex-start' },
    agendaContainer: { flex: 1 },
    agendaItem: { padding: 10 }
});


