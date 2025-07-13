import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Tile from '../components/Tile';
import { EVENT_COLOR } from '../utils/colors';

/**
 * Simple dashboard shown on login. It lists upcoming events for the
 * current user and displays the accumulated score and completed tasks.
 */
export default function DashboardPage({ user, navigate }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalScore: 0, completedTasks: 0 });

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:3000/events')
      .then(res => res.json())
      .then(data => {
        const now = new Date().toISOString().split('T')[0];
        const filtered = data
          .filter(ev => ev.assignedTo === user.id && ev.date >= now)
          .filter(ev => ev.state !== 'completed')
          .sort((a, b) => {
            const da = new Date(`${a.date}T${a.time || '00:00'}`);
            const db = new Date(`${b.date}T${b.time || '00:00'}`);
            return da - db;
          })
          .slice(0, 50); // only show the next 50 events
        setEvents(filtered);
      })
      .catch(() => {});
    fetch('http://localhost:3000/tasks')
      .then(res => res.json())
      .then(setTasks)
      .catch(() => {});
    fetch('http://localhost:3000/users')
      .then(res => res.json())
      .then(users => {
        const me = users.find(u => u.id === user.id);
        if (me) setStats({ totalScore: me.totalScore, completedTasks: me.completedTasks });
      })
      .catch(() => {});
  }, [user]);

  const taskMap = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      map[t.id] = t.name;
    });
    return map;
  }, [tasks]);

  const renderItem = ({ item }) => (
    <Tile
      title={`${item.date} ${item.time || ''}`}
      subtitle={taskMap[item.taskId] || item.taskId}
      color={EVENT_COLOR}
      actions={
        <IconButton
          icon="pencil"
          onPress={() => navigate('event-edit', { event: item, origin: 'dashboard' })}
        />
      }
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.stat}>Total Points: {stats.totalScore}</Text>
      <Text style={styles.stat}>Completed Tasks: {stats.completedTasks}</Text>
      <Text style={styles.subtitle}>Upcoming Events</Text>
      <View style={styles.eventPanel}>
        <FlatList
          data={events}
          keyExtractor={e => e.id}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
  subtitle: { fontSize: 18, marginTop: 12, marginBottom: 8 },
  stat: { marginBottom: 4 },
  eventPanel: { maxHeight: 450 },
});
