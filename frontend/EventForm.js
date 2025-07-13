import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
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

  const saveEvent = async () => {
    await fetch(`http://localhost:3000/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time }),
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
});

