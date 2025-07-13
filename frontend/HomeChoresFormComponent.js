import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

/**
 * Generic wrapper component providing a consistent layout for forms in the
 * application.  It renders a title, the form fields passed as children and a
 * row of action buttons. The callbacks for those buttons are provided by the
 * caller so that each form can decide what "submit" and "cancel" do.
 */
export default function HomeChoresFormComponent({
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
      <View style={styles.buttonRow}>
        {onCancel && (
          <View style={styles.buttonWrapper}>
            <Button title={cancelLabel} onPress={onCancel} />
          </View>
        )}
        {onSubmit && (
          <View style={styles.buttonWrapper}>
            <Button title={submitLabel} onPress={onSubmit} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  buttonWrapper: { marginLeft: 8 },
});

