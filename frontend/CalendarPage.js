// CalendarPage.js
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Button, useWindowDimensions } from 'react-native';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendarOverrides.css';
import { Calendar as BigCalendar } from 'react-native-big-calendar';

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

    const tileContent = ({ date }) => {
        const key = date.toISOString().split('T')[0];
        const count = (itemsByDate[key] || []).length;
        if (!count) return null;
        const color = getColor(count);
        return (
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundColor: color,
                opacity: 0.5,
                pointerEvents: 'none'
            }}/>
        );
    };

    const dailyEvents = useMemo(() => {
        if (!selectedDate) return [];
        return (itemsByDate[selectedDate] || []).map(ev => {
            const start = new Date(`${ev.date}T${ev.time || '00:00'}`);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            return {
                title: taskMap[ev.taskId]?.name || ev.taskId,
                start,
                end
            };
        });
    }, [selectedDate, itemsByDate, taskMap]);

    const { width } = useWindowDimensions();
    const isWide = width >= 768;

    const calendarComponent = (
        <Calendar
            onClickDay={d => setSelectedDate(d.toISOString().split('T')[0])}
            tileContent={tileContent}
        />
    );

    return (
        <View style={styles.container}>
            {isWide ? (
                <View style={styles.webLayout}>
                    <View style={styles.agendaContainer}>
                        {selectedDate && (
                            <>
                                <Button title="Back to calendar" onPress={() => setSelectedDate(null)} />
                                <BigCalendar events={dailyEvents} height={600} mode="day" />
                            </>
                        )}
                    </View>
                    <div style={{ width: 350 }}>
                        {calendarComponent}
                    </div>
                </View>
            ) : (
                selectedDate ? (
                    <View style={styles.agendaContainer}>
                        <Button title="Back to calendar" onPress={() => setSelectedDate(null)} />
                        <BigCalendar events={dailyEvents} height={600} mode="day" />
                    </View>
                ) : (
                    <View style={styles.mobileCalendar}>{calendarComponent}</View>
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
    agendaItem: { padding: 10 },
    mobileCalendar: { flex: 1 }
});


