// CalendarPage.js
import React, { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
    const [events, setEvents] = useState([]);

    // Daten laden
    useEffect(() => {
        fetch('http://localhost:3000/events')
            .then(res => res.json())
            .then(setEvents)
            .catch(console.error);
    }, []);

    // Nach Datum gruppieren
    const itemsByDate = useMemo(() => {
        return events.reduce((acc, ev) => {
            if (!ev.date) return acc;
            acc[ev.date] = acc[ev.date] || [];
            acc[ev.date].push(ev);
            return acc;
        }, {});
    }, [events]);

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>Task Calendar</h1>
            <Calendar
                tileContent={({ date }) => {
                    const key = date.toISOString().split('T')[0];
                    const dayEvents = itemsByDate[key] || [];
                    return dayEvents.length
                        ? <span style={{ fontSize: 12, color: '#333' }}>
                {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
              </span>
                        : null;
                }}
            />
        </div>
    );
}
