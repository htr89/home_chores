import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import { LOCALE } from './config';

export default function TaskForm({ task, navigate }) {
  const editMode = !!task;

  const formatDate = d => d.toLocaleDateString(LOCALE);
  const formatTime = d => d.toTimeString().slice(0, 5);

  const [name, setName] = useState(task?.name || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || '');
  const [users, setUsers] = useState([]);
  const [dueDate, setDueDate] = useState(task?.dueDate || formatDate(new Date()));
  const [dueTime, setDueTime] = useState(formatTime(new Date()));
  const [timeVisible, setTimeVisible] = useState(false);
  const [points, setPoints] = useState(task?.points ? String(task.points) : '');
  const [repetition, setRepetition] = useState(task?.repetition || 'none');
  const [endDate, setEndDate] = useState(task?.endDate || '');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('http://localhost:3000/users');
      const data = await res.json();
      setUsers(data);
      if (!assignedTo && data.length > 0) {
        setAssignedTo(data[0].id);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (repetition === 'none') { setEndDate(''); return; }
    const d = new Date(dueDate.split('.').reverse().join('-'));
    if (repetition === 'weekly') d.setMonth(d.getMonth() + 1);
    if (repetition === 'monthly') d.setFullYear(d.getFullYear() + 1);
    if (repetition === 'yearly') d.setFullYear(d.getFullYear() + 5);
    setEndDate(formatDate(d));
  }, [dueDate, repetition]);

  const handleSubmit = async () => {
    const data = { name, assignedTo, dueDate, dueTime, points, repetition, endDate };
    if (editMode) {
      await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    navigate('list');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editMode ? 'Edit Task' : 'Create Task'}</Text>
      <TextInput
        placeholder="Task name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <View style={styles.row}>
        <Picker
          selectedValue={assignedTo}
          onValueChange={setAssignedTo}
          style={[styles.input, styles.half, styles.spacer]}
        >
          {users.map(u => (
            <Picker.Item key={u.id} label={u.name} value={u.id} />
          ))}
        </Picker>
        <TextInput
          placeholder="Points"
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
          style={[styles.input, styles.half]}
        />
      </View>
      <View style={styles.row}>
        <DatePickerInput
          locale={LOCALE}
          label="Due date"
          value={dueDate ? new Date(dueDate.split('.').reverse().join('-')) : undefined}
          onChange={d => setDueDate(formatDate(d))}
          inputEnabled
          style={[styles.input, styles.half, styles.spacer]}
        />
        <View style={[styles.half, styles.buttonWrapper]}>
          <Button title={`Time: ${dueTime}`} onPress={() => setTimeVisible(true)} />
        </View>
      </View>
      <TimePickerModal
        locale={LOCALE}
        visible={timeVisible}
        onDismiss={() => setTimeVisible(false)}
        onConfirm={({ hours, minutes }) => {
          setTimeVisible(false);
          const hh = String(hours).padStart(2, '0');
          const mm = String(minutes).padStart(2, '0');
          setDueTime(`${hh}:${mm}`);
        }}
        hours={parseInt(dueTime.split(':')[0], 10)}
        minutes={parseInt(dueTime.split(':')[1], 10)}
      />
      <Picker
        selectedValue={repetition}
        onValueChange={setRepetition}
        style={styles.input}
      >
        <Picker.Item label="No repeat" value="none" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
        <Picker.Item label="Yearly" value="yearly" />
      </Picker>
      {repetition !== 'none' && (
        <DatePickerInput
          locale={LOCALE}
          label="End date"
          value={endDate ? new Date(endDate.split('.').reverse().join('-')) : undefined}
          onChange={d => setEndDate(formatDate(d))}
          inputEnabled
          style={styles.input}
        />
      )}
      <Button title={editMode ? 'Save' : 'Add Task'} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  half: { flex: 1 },
  spacer: { marginRight: 8 },
  buttonWrapper: {
    justifyContent: 'center',
  },
});
