import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, Button} from 'react-native';
import { IconButton } from 'react-native-paper';
import Tile from './Tile';
import { EVENT_COLOR } from './colors';

export default function EventsPage({task, navigate}) {
    const [events, setEvents] = useState([]);

    const load = async () => {
        const res = await fetch(`http://localhost:3000/events?taskId=${task.id}`);
        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => { load(); }, []);


    const handleComplete = async (id) => {
        await fetch(`http://localhost:3000/events/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({state: 'completed'})
        });
        load();
    };

    const renderItem = ({item}) => (
        <EventRow item={item} onComplete={handleComplete} navigate={navigate} />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Events for {task.name}</Text>
            <FlatList
                data={events}
                keyExtractor={e => e.id}
                renderItem={renderItem}
            />
            <Button title="Back to tasks" onPress={() => navigate('list')} />
        </View>
    );
}

function EventRow({item, onComplete, navigate}) {
    const actions = (
        <>
            <IconButton icon="check" onPress={() => onComplete(item.id)} disabled={item.state === 'completed'} />
            <IconButton icon="pencil" onPress={() => navigate('event-edit', { event: item, origin: 'events' })} />
        </>
    );

    return (
        <Tile
            title={`${item.date} ${item.time}${item.state === 'completed' ? ' (completed)' : ''}`}
            color={EVENT_COLOR}
            actions={actions}
        />
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    title: {fontSize: 24, marginBottom: 16}
});
