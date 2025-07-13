import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';

export default function LoginPage({ onLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.rememberRow}>
        <Switch value={remember} onValueChange={setRemember} />
        <Text style={styles.rememberLabel}>Remember me</Text>
      </View>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rememberLabel: { marginLeft: 8 },
});
