import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, useWindowDimensions } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { DatePickerInput, TimePickerModal } from 'react-native-paper-dates';
import { LOCALE } from '../utils/config';
import HomeChoresFormComponent from '../components/HomeChoresFormComponent';

export default function TaskForm({ task, navigate }) {
  const editMode = !!task;

  const { width } = useWindowDimensions();
  const isNarrow = width < 500;

  const formatDate = d => d.toLocaleDateString(LOCALE);
  const formatTime = d => d.toTimeString().slice(0, 5);

  const [name, setName] = useState(task?.name || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || '');
  const [users, setUsers] = useState([]);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? formatDate(new Date(task.dueDate)) : formatDate(new Date())
  );
  const [dueTime, setDueTime] = useState(formatTime(new Date()));
  const [timeVisible, setTimeVisible] = useState(false);
  const [points, setPoints] = useState(task?.points ? String(task.points) : '');
  const [repetition, setRepetition] = useState(task?.repetition || 'none');
  const [endDate, setEndDate] = useState(
    task?.endDate ? formatDate(new Date(task.endDate)) : ''
  );
  const [steps, setSteps] = useState([]);
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await fetch('http://localhost:3000/users');
      const data = await res.json();
      setUsers(data);
      if (!assignedTo && data.length > 0) {
        setAssignedTo(data[0].id);
      }
      if (editMode) {
        const r2 = await fetch(`http://localhost:3000/steps?taskId=${task.id}`);
        const sdata = await r2.json();
        setSteps(sdata);
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

  const saveTask = async () => {
    const data = { name, assignedTo, dueDate, dueTime, points, repetition, endDate };
    if (editMode) {
      await fetch(`http://localhost:3000/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      data.steps = steps.map(s => s.text);
      const res = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const created = await res.json();
      for (const s of steps) {
        await fetch('http://localhost:3000/steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: created.id, text: s.text })
        });
      }
    }
  };

  const handleSubmit = async () => {
    await saveTask();
    navigate('list');
  };

  const addStep = async () => {
    if (!newStep.trim()) return;
    if (editMode) {
      await fetch('http://localhost:3000/steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, text: newStep })
      });
      const r = await fetch(`http://localhost:3000/steps?taskId=${task.id}`);
      setSteps(await r.json());
    } else {
      setSteps([...steps, { id: Date.now().toString(), text: newStep }]);
    }
    setNewStep('');
  };

  const removeStep = async (id) => {
    if (editMode) {
      await fetch(`http://localhost:3000/steps/${id}`, { method: 'DELETE' });
      const r = await fetch(`http://localhost:3000/steps?taskId=${task.id}`);
      setSteps(await r.json());
    } else {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  return (
    <HomeChoresFormComponent
      title={editMode ? 'Edit Task' : 'Create Task'}
      onCancel={() => navigate('list')}
      onSubmit={handleSubmit}
      submitIcon={editMode ? 'content-save' : 'plus'}
    >
      <TextInput
        placeholder="Task name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <View style={[styles.row, isNarrow && styles.column]}>
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
      <View style={[styles.row, isNarrow && styles.column]}>
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
      <Text style={styles.subtitle}>Steps</Text>
      {steps.map(s => (
        <View key={s.id} style={[styles.row, isNarrow && styles.column]}>
          <Text style={[styles.input, styles.half]}>{s.text}</Text>
          <View style={styles.buttonWrapper}>
            <IconButton icon="delete" onPress={() => removeStep(s.id)} />
          </View>
        </View>
      ))}
      <View style={[styles.row, isNarrow && styles.column]}>
        <TextInput
          placeholder="New step"
          value={newStep}
          onChangeText={setNewStep}
          style={[styles.input, styles.half, styles.spacer]}
        />
        <View style={styles.buttonWrapper}>
          <IconButton icon="plus" onPress={addStep} />
        </View>
      </View>
    </HomeChoresFormComponent>
  );
}

const styles = StyleSheet.create({
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
  column: { flexDirection: 'column' },
  half: { flex: 1 },
  spacer: { marginRight: 8 },
  buttonWrapper: {
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    marginBottom: 4
  }
});
