import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Text, TextInput, Button, Switch, Surface } from 'react-native-paper';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 500;

  const handleLogin = async () => {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    if (res.ok) {
      const user = await res.json();
      if (remember && typeof localStorage !== 'undefined') {
        localStorage.setItem('login', JSON.stringify({ name, password }));
      } else if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('login');
      }
      onLogin(user);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Surface style={[styles.container, isWide && styles.containerWide]} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Login</Text>
        <TextInput
          label="Username"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <View style={styles.rememberRow}>
          <Switch value={remember} onValueChange={setRemember} />
          <Text style={styles.rememberLabel}>Remember me</Text>
        </View>
        <Button mode="contained" onPress={handleLogin}>Login</Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: { flex: 1, width: '100%', padding: 16, borderRadius: 8 },
  containerWide: { width: 400, alignSelf: 'center' },
  title: { textAlign: 'center', marginBottom: 16 },
  input: { marginBottom: 8 },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rememberLabel: { marginLeft: 8 },
});
