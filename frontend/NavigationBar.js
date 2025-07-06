import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function NavigationBar({ navigate }) {
    return (
        <View style={styles.nav}>
            <Button title="Add Task" onPress={() => navigate('create')} />
            <View style={{height: 10}} />
            <Button title="Task List" onPress={() => navigate('list')} />
            <View style={{height: 10}} />
            <Button title="Users" onPress={() => navigate('users')} />
            <View style={{height: 10}} />
            <Button title="Calendar" onPress={() => navigate('calendar')} />
        </View>
    );
}

const styles = StyleSheet.create({
    nav: {
        width: 160,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
});
