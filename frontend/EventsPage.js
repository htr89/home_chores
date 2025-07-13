import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, TextInput, Button} from 'react-native';
import {Card, IconButton} from 'react-native-paper';
import {DatePickerInput} from 'react-native-paper-dates';
import {LOCALE} from './config';

export default function EventsPage({task, navigate}) {
    const [events, setEvents] = useState([]);

    const load = async () => {
        const res = await fetch(`http://localhost:3000/events?taskId=${task.id}`);
        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (id, changes) => {
        await fetch(`http://localhost:3000/events/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(changes)
        });
        load();
    };

    const renderItem = ({item}) => (
        <EventRow item={item} onSave={handleSave}/>
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

function EventRow({item, onSave}) {
    const [date, setDate] = useState(item.date);
    const [time, setTime] = useState(item.time);
    const [editMode, setEditMode] = useState(false);

    const save = () => {
        onSave(item.id, {date, time});
        setEditMode(false);
    };

    return (
        <Card style={styles.card}>
            <Card.Title title={`${item.date} ${item.time}`} />
            {editMode && (
                <Card.Content>
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
                </Card.Content>
            )}
            <Card.Actions>
                {editMode ? (
                    <>
                        <Button title="Save" onPress={save} />
                        <Button title="Cancel" onPress={() => setEditMode(false)} />
                    </>
                ) : (
                    <IconButton icon="pencil" onPress={() => setEditMode(true)} />
                )}
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    title: {fontSize: 24, marginBottom: 16},
    card: {marginBottom: 8},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 8,
        padding: 8,
        borderRadius: 4,
    }
});
