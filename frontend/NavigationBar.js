import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Drawer, IconButton, Tooltip } from 'react-native-paper';

export default function NavigationBar({ navigate, open, setOpen }) {
    const items = [
        {key: 'create', label: 'Add Task', icon: 'plus'},
        {key: 'list', label: 'Task List', icon: 'format-list-bulleted'},
        {key: 'users', label: 'Users', icon: 'account-group'},
        {key: 'calendar', label: 'Calendar', icon: 'calendar'},
    ];

    return (
        <View style={[styles.nav, {width: open ? 160 : 72}]}> 
            <IconButton
                icon={open ? 'chevron-left' : 'chevron-right'}
                onPress={() => setOpen(!open)}
                style={styles.toggle}
            />
            <Drawer.Section style={{flex: 1}}>
                {items.map(item => (
                    open ? (
                        <Drawer.Item
                            key={item.key}
                            label={item.label}
                            icon={item.icon}
                            onPress={() => navigate(item.key)}
                        />
                    ) : (
                        <Tooltip key={item.key} title={item.label}>
                            <IconButton
                                icon={item.icon}
                                onPress={() => navigate(item.key)}
                            />
                        </Tooltip>
                    )
                ))}
            </Drawer.Section>
        </View>
    );
}

const styles = StyleSheet.create({
    nav: {
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    toggle: {
        alignSelf: 'flex-end',
    },
});
