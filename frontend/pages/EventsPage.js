import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { IconButton } from 'react-native-paper';
import Tile from '../components/Tile';
import { EVENT_COLOR } from '../utils/colors';
import { formatDateLocal } from '../utils/config';

export default function EventsPage({ task, navigate, setNavigationGuard, user, setUser }) {
    const [events, setEvents] = useState([]);
    const [progressMap, setProgressMap] = useState({});

    const load = async () => {
        const res = await fetch(`http://localhost:3000/events?taskId=${task.id}`);
        const data = await res.json();
        setEvents(data);
    };

    useEffect(() => { load(); }, []);

    const unsaved = Object.values(progressMap).some(Boolean);

    useEffect(() => {
        const handler = (e) => {
            if (!unsaved) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [unsaved]);

    useEffect(() => {
        if (!setNavigationGuard) return;
        const guard = () => {
            if (!unsaved) return true;
            return window.confirm('Leave page and lose step progress?');
        };
        setNavigationGuard(() => guard);
        return () => setNavigationGuard(null);
    }, [unsaved, setNavigationGuard]);


    const handleComplete = async (id) => {
        await fetch(`http://localhost:3000/events/${id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ state: 'completed' })
        });
        setProgressMap(pm => {
            const cp = { ...pm };
            delete cp[id];
            return cp;
        });
        load();
    };

    const renderItem = ({ item }) => (
        <EventRow
            item={item}
            onComplete={handleComplete}
            navigate={navigate}
            reportProgress={(id, p) =>
                setProgressMap(m => ({ ...m, [id]: p }))
            }
            user={user}
            setUser={setUser}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Events for {task.name}</Text>
            <FlatList
                data={events}
                keyExtractor={e => e.id}
                renderItem={renderItem}
            />
            <Button
                title="Back to tasks"
                onPress={() => navigate('list')}
            />
        </View>
    );
}

function EventRow({ item, onComplete, navigate, reportProgress, user, setUser }) {
    const [steps, setSteps] = useState([]);
    const [done, setDone] = useState({});
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const load = async () => {
            const r = await fetch(`http://localhost:3000/steps?taskId=${item.taskId}`);
            const data = await r.json();
            setSteps(data);
        };
        load();
    }, [item.taskId]);

    useEffect(() => {
        const completed = steps.filter(s => done[s.id]).length;
        const allDone = steps.length > 0 && completed === steps.length;
        const inProgress = completed > 0 && !allDone && item.state !== 'completed';
        reportProgress(item.id, inProgress);
        if (allDone && item.state !== 'completed') {
            onComplete(item.id);
        }
    }, [done, steps]);

    const toggle = id => {
        setDone(d => ({ ...d, [id]: !d[id] }));
    };

    const toggleFavorite = async () => {
        const fav = !(user.favorites || []).includes(item.id);
        await fetch(`http://localhost:3000/users/${user.id}/favorites`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ eventId: item.id, favorite: fav })
        });
        const list = fav
            ? [ ...(user.favorites || []), item.id ]
            : (user.favorites || []).filter(f => f !== item.id);
        setUser({ ...user, favorites: list });
    };

    const actions = (
        <>
            <IconButton icon={(user.favorites || []).includes(item.id) ? 'star' : 'star-outline'} onPress={toggleFavorite} />
            <IconButton icon="check" onPress={() => onComplete(item.id)} disabled={item.state === 'completed'} />
            <IconButton icon="pencil" onPress={() => navigate('event-edit', { event: item, origin: 'events' })} />
        </>
    );

    return (
        <Tile
            title={`${formatDateLocal(item.date)} ${item.time}${item.state === 'completed' ? ' (completed)' : ''}`}
            color={EVENT_COLOR}
            actions={actions}
            onPress={() => setExpanded(!expanded)}
        >
            <View style={expanded ? null : styles.stepContainer}>
                {steps.map(s => (
                    <View key={s.id} style={styles.stepRow}>
                        <IconButton
                            icon={done[s.id] ? 'check-circle-outline' : 'checkbox-blank-circle-outline'}
                            size={18}
                            onPress={() => toggle(s.id)}
                        />
                        <Text style={styles.stepText}>{s.text}</Text>
                    </View>
                ))}
            </View>
        </Tile>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20},
    title: {fontSize: 24, marginBottom: 16},
    stepContainer: { maxHeight: 100, overflow: 'hidden' },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    stepText: { flex: 1 }
});
