import React from 'react';
import { Card } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function Tile({ title, subtitle, children, actions, color }) {
  return (
    <Card style={[styles.card, { borderLeftColor: color }]}>
      {(title || subtitle) && <Card.Title title={title} subtitle={subtitle} />}
      {children && <Card.Content>{children}</Card.Content>}
      {actions && <Card.Actions>{actions}</Card.Actions>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderLeftWidth: 6,
  },
});

