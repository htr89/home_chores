import React, { useState } from 'react';
import { View, Button, StyleSheet, TextInput } from 'react-native';
import { TimePickerModal } from 'react-native-paper-dates';
import HomeChoresFormComponent from '../components/HomeChoresFormComponent';
import API_URL from '../api';

export default function SettingsPage({ user, setUser, navigate }) {
  const [start, setStart] = useState(user.config?.workingHoursStart || '06:00');
  const [end, setEnd] = useState(user.config?.workingHoursEnd || '22:00');
  const [calendarId, setCalendarId] = useState(user.config?.googleCalendarId || '');
  const [apiKey, setApiKey] = useState(user.config?.googleApiKey || '');
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const save = async () => {
    await fetch(`${API_URL}/users/${user.id}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workingHoursStart: start,
        workingHoursEnd: end,
        googleCalendarId: calendarId,
        googleApiKey: apiKey,
      })
    });
    setUser({
      ...user,
      config: {
        ...user.config,
        workingHoursStart: start,
        workingHoursEnd: end,
        googleCalendarId: calendarId,
        googleApiKey: apiKey,
      },
    });
    navigate('list');
  };

  return (
    <HomeChoresFormComponent title="Settings" onSubmit={save} onCancel={() => navigate('list')} submitIcon="content-save">
      <View style={styles.row}>
        <Button title={`Start: ${start}`} onPress={() => setShowStart(true)} />
      </View>
      <TimePickerModal
        visible={showStart}
        onDismiss={() => setShowStart(false)}
        onConfirm={({ hours, minutes }) => {
          setShowStart(false);
          const hh = String(hours).padStart(2, '0');
          const mm = String(minutes).padStart(2, '0');
          setStart(`${hh}:${mm}`);
        }}
        hours={parseInt(start.split(':')[0], 10)}
        minutes={parseInt(start.split(':')[1], 10)}
      />
      <View style={styles.row}>
        <Button title={`End: ${end}`} onPress={() => setShowEnd(true)} />
      </View>
      <TimePickerModal
        visible={showEnd}
        onDismiss={() => setShowEnd(false)}
        onConfirm={({ hours, minutes }) => {
          setShowEnd(false);
          const hh = String(hours).padStart(2, '0');
          const mm = String(minutes).padStart(2, '0');
          setEnd(`${hh}:${mm}`);
        }}
        hours={parseInt(end.split(':')[0], 10)}
        minutes={parseInt(end.split(':')[1], 10)}
      />
      <TextInput
        placeholder="Google Calendar ID"
        value={calendarId}
        onChangeText={setCalendarId}
        style={styles.input}
      />
      <TextInput
        placeholder="Google API Key"
        value={apiKey}
        onChangeText={setApiKey}
        style={styles.input}
      />
    </HomeChoresFormComponent>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
});
