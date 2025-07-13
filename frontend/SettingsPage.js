import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { TimePickerModal } from 'react-native-paper-dates';
import HomeChoresFormComponent from './HomeChoresFormComponent';

export default function SettingsPage({ user, setUser, navigate }) {
  const [start, setStart] = useState(user.config?.workingHoursStart || '06:00');
  const [end, setEnd] = useState(user.config?.workingHoursEnd || '22:00');
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const save = async () => {
    await fetch(`http://localhost:3000/users/${user.id}/config`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workingHoursStart: start, workingHoursEnd: end })
    });
    setUser({ ...user, config: { ...user.config, workingHoursStart: start, workingHoursEnd: end } });
    navigate('list');
  };

  return (
    <HomeChoresFormComponent title="Settings" onSubmit={save} onCancel={() => navigate('list')} submitLabel="Save">
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
    </HomeChoresFormComponent>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 8 }
});
