import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { IconButton, Button as PaperButton } from 'react-native-paper';
import Tile from '../components/Tile';
import { USER_COLOR } from '../utils/colors';

export default function UserPage({ navigate }) {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await fetch('http://localhost:3000/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => (
    <Tile
      title={item.name}
      subtitle={`${item.totalScore} pts - ${item.completedTasks} events`}
      color={USER_COLOR}
      actions={<IconButton icon="pencil" onPress={() => navigate('user-edit', item)} />}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <FlatList data={users} keyExtractor={u => u.id} renderItem={renderItem} />
      <PaperButton
        mode="contained"
        icon="plus"
        onPress={() => navigate('user-create')}
        buttonColor="#2196f3"
        textColor="#fff"
        compact
      >
        {''}
      </PaperButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
});
