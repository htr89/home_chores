import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import Tile from '../components/Tile';
import { TASK_COLOR } from '../utils/colors';
import { formatDateLocal } from '../utils/config';

export default function TaskPage({ navigate }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState({});

  const load = async () => {
    const res = await fetch('http://localhost:3000/tasks');
    const data = await res.json();
    setTasks(data);
    const resUsers = await fetch('http://localhost:3000/users');
    const userData = await resUsers.json();
    const map = {};
    userData.forEach(u => {
      map[u.id] = u.name;
    });
    setUsers(map);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDuplicate = async id => {
    await fetch(`http://localhost:3000/tasks/${id}/duplicate`, { method: 'POST' });
    load();
  };

  const handleDelete = async id => {
    await fetch(`http://localhost:3000/tasks/${id}`, { method: 'DELETE' });
    load();
  };

  const renderItem = ({ item }) => (
    <TaskRow
      item={item}
      users={users}
      onEdit={task => navigate('edit', task)}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      navigate={navigate}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task List</Text>
      <FlatList data={tasks} keyExtractor={t => t.id} renderItem={renderItem} />
    </View>
  );
}

function TaskRow({ item, users, onEdit, onDuplicate, onDelete, navigate }) {
  const actions = (
    <>
      <IconButton icon="pencil" onPress={() => onEdit(item)} />
      <IconButton icon="content-copy" onPress={() => onDuplicate(item.id)} />
      <IconButton icon="calendar" onPress={() => navigate('events', item)} />
      <IconButton icon="delete" onPress={() => onDelete(item.id)} />
    </>
  );
  return (
    <Tile
      title={item.name}
      subtitle={`${users[item.assignedTo] || item.assignedTo} • due ${formatDateLocal(item.dueDate)} • ${item.points} pts`}
      actions={actions}
      color={TASK_COLOR}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
});
