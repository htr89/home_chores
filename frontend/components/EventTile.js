import React from 'react';
import { IconButton } from 'react-native-paper';
import Tile from './Tile';
import { EVENT_COLOR } from '../utils/colors';
import { formatDateLocal, formatTimeLocal } from '../utils/config';

export default function EventTile({
  event,
  taskName,
  user,
  setUser,
  navigate,
  onComplete,
  onDelete,
  onPress,
  children,
}) {
  const toggleFavorite = async () => {
    const fav = !(user.favorites || []).includes(event.id);
    await fetch(`http://localhost:3000/users/${user.id}/favorites`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event.id, favorite: fav }),
    });
    const list = fav
      ? [ ...(user.favorites || []), event.id ]
      : (user.favorites || []).filter(f => f !== event.id);
    setUser({ ...user, favorites: list });
  };

  const addToGoogle = async () => {
    const calId = user.config?.googleCalendarId;
    const apiKey = user.config?.googleApiKey;
    if (!calId || !apiKey) {
      alert('Google Calendar credentials missing in settings');
      return;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const toLocal = d => d.toLocaleString('sv-SE', { timeZone: tz }).replace(' ', 'T');
    const body = {
      summary: taskName,
      start: { dateTime: toLocal(start), timeZone: tz },
      end: { dateTime: toLocal(end), timeZone: tz },
    };
    try {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert('Event added to Google Calendar');
      } else {
        const msg = await res.text();
        alert('Failed to add event: ' + msg);
      }
    } catch (e) {
      alert('Failed to add event');
    }
  };

  const actions = (
    <>
      <IconButton
        icon={(user.favorites || []).includes(event.id) ? 'star' : 'star-outline'}
        onPress={toggleFavorite}
      />
      {onComplete && (
        <IconButton
          icon="check"
          onPress={() => onComplete(event.id)}
          disabled={event.state === 'completed'}
        />
      )}
      {navigate && (
        <IconButton
          icon="pencil"
          onPress={() => navigate('event-edit', { event, origin: 'events' })}
        />
      )}
      <IconButton icon="google" onPress={addToGoogle} />
      {onDelete && <IconButton icon="delete" onPress={() => onDelete(event.id)} />}
    </>
  );

  return (
    <Tile
      title={`${formatDateLocal(event.date)} ${formatTimeLocal(event.date)}${event.state === 'completed' ? ' (completed)' : ''}`}
      subtitle={taskName}
      color={EVENT_COLOR}
      actions={actions}
      onPress={onPress}
    >
      {children}
    </Tile>
  );
}
