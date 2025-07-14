import React from 'react';
import { View, Text, Button, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';

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
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={[styles.container, isWide && styles.wide]}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  wide: {
    width: 600,
    alignSelf: 'center',
  },
  title: { fontSize: 24, marginBottom: 16, color: '#000' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  buttonWrapper: { marginLeft: 8 },
});

