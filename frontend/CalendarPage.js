// CalendarPage.js
import React, { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarPage() {
    const [tasks, setTasks] = useState([]);

    // Daten laden
    useEffect(() => {
        fetch('http://localhost:3000/tasks')
            .then(res => res.json())
            .then(setTasks)
            .catch(console.error);
    }, []);

    // Nach Datum gruppieren
    const itemsByDate = useMemo(() => {
        return tasks.reduce((acc, task) => {
            if (!task.dueDate) return acc;
            acc[task.dueDate] = acc[task.dueDate] || [];
            acc[task.dueDate].push(task);
            return acc;
        }, {});
    }, [tasks]);

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>Task Calendar</h1>
            <Calendar
                tileContent={({ date }) => {
                    const key = date.toISOString().split('T')[0];
                    const dayTasks = itemsByDate[key] || [];
                    // Zeige Anzahl der Tasks oder gar nichts
                    return dayTasks.length
                        ? <span style={{ fontSize: 12, color: '#333' }}>
                {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
              </span>
                        : null;
                }}
            />
        </div>
    );
}
