import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import HomeChoresFormComponent from '../components/HomeChoresFormComponent';
import API_URL from '../api';

export default function UserForm({ user, navigateBack }) {
  const editMode = !!user;
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    const body = { name };
    if (password) body.password = password;
    if (editMode) {
      await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } else {
      await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }
    navigateBack();
  };

  return (
    <HomeChoresFormComponent
      title={editMode ? 'Edit User' : 'Add User'}
      onSubmit={handleSubmit}
      onCancel={navigateBack}
      submitIcon={editMode ? 'content-save' : 'plus'}
    >
      <TextInput
        placeholder="User name"
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
    </HomeChoresFormComponent>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 4
  }
});
