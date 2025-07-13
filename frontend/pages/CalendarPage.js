import React, {useEffect, useState, useMemo} from 'react';
import {View, Button, StyleSheet, useWindowDimensions} from 'react-native';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendarOverrides.css';
import {Calendar as BigCalendar} from 'react-native-big-calendar';
import {LOCALE} from '../utils/config';

export default function CalendarPage({ navigate, user, globalConfig }) {
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

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
        tasks.forEach(t => {
            map[t.id] = t;
        });
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

    const dateToISO = date => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const tileContent = ({date}) => {
        const key = dateToISO(date);
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
        const isoDate = convertToISO(selectedDate);
        return (itemsByDate[isoDate] || []).map(ev => {
            const start = new Date(`${ev.date}T${ev.time || '00:00'}`);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            return {
                id: ev.id,
                title: taskMap[ev.taskId]?.name || ev.taskId,
                start,
                end
            };
        });
    }, [selectedDate, itemsByDate, taskMap]);

    const {width} = useWindowDimensions();
    const isWide = width >= 768;

    const start = user?.config?.workingHoursStart || globalConfig?.workingHoursStart || '06:00';
    const end = user?.config?.workingHoursEnd || globalConfig?.workingHoursEnd || '22:00';
    const minHour = parseInt(start.split(':')[0], 10);
    const maxHour = parseInt(end.split(':')[0], 10);

    const calendarComponent = (
        <Calendar
            locale={LOCALE}
            onClickDay={dateObj => setSelectedDate(
                dateObj.toLocaleDateString(LOCALE)
            )}
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
                                <Button title="Back to calendar" onPress={() => setSelectedDate(null)}/>
                                <BigCalendar
                                    locale={LOCALE}
                                    events={dailyEvents}
                                    height={600}
                                    mode="day"
                                    minHour={minHour}
                                    maxHour={maxHour}
                                    date={new Date(
                                        ...selectedDate.split('.').reverse().map(Number).map((val, i) => i === 1 ? val - 1 : val)
                                    )}
                                    onPressEvent={e => {
                                        const iso = convertToISO(selectedDate);
                                        const orig = (itemsByDate[iso] || []).find(ev => ev.id === e.id);
                                        if (orig) navigate('event-edit', { event: orig, origin: 'calendar' });
                                    }}
                                />
                            </>
                        )}
                    </View>
                    <div style={{width: 350}}>
                        {calendarComponent}
                    </div>
                </View>
            ) : (
                selectedDate ? (
                    <View style={styles.agendaContainer}>
                        <Button title="Back to calendar" onPress={() => setSelectedDate(null)}/>
                        <BigCalendar
                            locale={LOCALE}
                            events={dailyEvents}
                            height={600}
                            mode="day"
                            minHour={minHour}
                            maxHour={maxHour}
                            date={new Date(
                                ...selectedDate.split('.').reverse().map(Number).map((val, i) => i === 1 ? val - 1 : val)
                            )}
                            onPressEvent={e => {
                                const iso = convertToISO(selectedDate);
                                const orig = (itemsByDate[iso] || []).find(ev => ev.id === e.id);
                                if (orig) navigate('event-edit', { event: orig, origin: 'calendar' });
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.mobileCalendar}>{calendarComponent}</View>
                )
            )}
        </View>
    );
}

function convertToISO(dateStr) {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function getColor(count) {
    const capped = Math.min(Math.max(count, 0), 10);
    if (capped === 0) return 'transparent';
    const ratio = capped / 10;
    const hue = 120 - 120 * ratio;
    return `hsl(${hue}, 70%, 70%)`;
}

const styles = StyleSheet.create({
    container: {flex: 1},
    webLayout: {flex: 1, flexDirection: 'row'},
    agendaContainer: {flex: 1},
    mobileCalendar: {flex: 1}
});