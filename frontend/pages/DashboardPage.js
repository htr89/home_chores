import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import AppButton from '../components/AppButton';
import Tile from '../components/Tile';
import { EVENT_COLOR } from '../utils/colors';
import { formatDateLocal } from '../utils/config';

/**
 * Simple dashboard shown on login. It lists upcoming events for the
 * current user and displays the accumulated score and completed tasks.
 */
export default function DashboardPage({ user, navigate, setUser }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ totalScore: 0, completedTasks: 0 });
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    if (!user) return;
    fetch('http://localhost:3000/events')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(ev => ev.assignedTo === user.id);
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

  const sorted = useMemo(() => {
    const upcoming = events
      .filter(e => e.state !== 'completed')
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || '00:00'}`);
        const db = new Date(`${b.date}T${b.time || '00:00'}`);
        return da - db;
      });
    const completed = events
      .filter(e => e.state === 'completed')
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || '00:00'}`);
        const db = new Date(`${b.date}T${b.time || '00:00'}`);
        return db - da;
      });
    const favorites = events
      .filter(e => (user.favorites || []).includes(e.id))
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time || '00:00'}`);
        const db = new Date(`${b.date}T${b.time || '00:00'}`);
        return da - db;
      });
    return { upcoming, completed, favorites };
  }, [events, user.favorites]);

  const toggleFavorite = async (id) => {
    const fav = !(user.favorites || []).includes(id);
    await fetch(`http://localhost:3000/users/${user.id}/favorites`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: id, favorite: fav })
    });
    const list = fav
      ? [ ...(user.favorites || []), id ]
      : (user.favorites || []).filter(f => f !== id);
    setUser({ ...user, favorites: list });
  };

  const renderItem = ({ item }) => {
    const fav = (user.favorites || []).includes(item.id);
    return (
      <Tile
        title={`${formatDateLocal(item.date)} ${item.time || ''}`}
        subtitle={taskMap[item.taskId] || item.taskId}
        color={EVENT_COLOR}
        actions={
          <>
            <IconButton
              icon={fav ? 'star' : 'star-outline'}
              onPress={() => toggleFavorite(item.id)}
            />
            <IconButton
              icon="pencil"
              onPress={() => navigate('event-edit', { event: item, origin: 'dashboard' })}
            />
          </>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.stat}>Total Points: {stats.totalScore}</Text>
      <Text style={styles.stat}>Completed Tasks: {stats.completedTasks}</Text>
      <View style={styles.tabs}>
        <AppButton
          mode={tab === 'upcoming' ? 'contained' : 'outlined'}
          onPress={() => setTab('upcoming')}
          style={styles.tabButton}
        >
          Not Completed
        </AppButton>
        <AppButton
          mode={tab === 'completed' ? 'contained' : 'outlined'}
          onPress={() => setTab('completed')}
          style={styles.tabButton}
        >
          Completed
        </AppButton>
        <AppButton
          mode={tab === 'favorites' ? 'contained' : 'outlined'}
          onPress={() => setTab('favorites')}
          style={styles.tabButton}
        >
          Favorites
        </AppButton>
      </View>
      <Text style={styles.subtitle}>
        {tab === 'favorites' ? 'Favorite Events' : tab === 'completed' ? 'Completed Events' : 'Upcoming Events'}
      </Text>
      <View style={styles.eventPanel}>
        <FlatList
          data={
            tab === 'favorites'
              ? sorted.favorites
              : tab === 'completed'
              ? sorted.completed
              : sorted.upcoming
          }
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
  tabs: { flexDirection: 'row', marginVertical: 8 },
  tabButton: { marginRight: 8 },
  eventPanel: { maxHeight: 450 },
});
