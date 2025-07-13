import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { DatePickerInput } from 'react-native-paper-dates';
import HomeChoresFormComponent from './HomeChoresFormComponent';
import { LOCALE } from './config';

/**
 * Form for editing a single event.  It reuses the generic
 * HomeChoresFormComponent so that events and tasks share the same look and
 * feel.  The caller provides a `navigateBack` callback determining where the
 * user returns after submitting the changes.
 */
export default function EventForm({ event, navigateBack }) {
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time || '');
  const [assignedTo, setAssignedTo] = useState(event.assignedTo || '');
  const [state, setState] = useState(event.state || 'created');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('http://localhost:3000/users');
      const data = await res.json();
      setUsers(data);
      if (!assignedTo && data.length > 0) setAssignedTo(data[0].id);
    };
    load();
  }, []);

  const saveEvent = async () => {
    await fetch(`http://localhost:3000/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, assignedTo, state }),
    });
  };

  const handleSubmit = async () => {
    await saveEvent();
    navigateBack();
  };

  const handleCancel = () => {
    navigateBack();
  };

  return (
    <HomeChoresFormComponent
      title="Edit Event"
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      submitLabel="Save"
    >
      <DatePickerInput
        locale={LOCALE}
        label="Date"
        value={new Date(date)}
        onChange={d => setDate(d.toISOString().split('T')[0])}
        inputEnabled
        style={styles.input}
      />
      <TextInput
        value={time}
        onChangeText={setTime}
        style={styles.input}
        placeholder="HH:MM"
      />
      <Picker
        selectedValue={assignedTo}
        onValueChange={setAssignedTo}
        style={styles.input}
      >
        {users.map(u => (
          <Picker.Item key={u.id} label={u.name} value={u.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={state}
        onValueChange={setState}
        style={styles.input}
      >
        <Picker.Item label="Created" value="created" />
        <Picker.Item label="Completed" value="completed" />
      </Picker>
      <View style={styles.readonlyWrapper}>
        <Text style={styles.readonlyLabel}>Points:</Text>
        <Text>{event.points}</Text>
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
  readonlyWrapper: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readonlyLabel: {
    marginRight: 4,
  }
});

