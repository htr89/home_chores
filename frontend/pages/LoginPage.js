import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, useWindowDimensions, ScrollView } from 'react-native';

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
    <View style={[styles.container, isWide && styles.containerWide]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: { flex: 1, width: '100%' },
  containerWide: { width: 400, alignSelf: 'center' },
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
