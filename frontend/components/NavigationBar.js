import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Drawer, IconButton, Tooltip, Surface, useTheme} from 'react-native-paper';

export default function NavigationBar({navigate, open, setOpen, onLogout}) {
    const items = [
        {key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard'},
        {key: 'create', label: 'Add Task', icon: 'plus'},
        {key: 'list', label: 'Task List', icon: 'format-list-bulleted'},
        {key: 'users', label: 'Users', icon: 'account-group'},
        {key: 'calendar', label: 'Calendar', icon: 'calendar'},
    ];

    const theme = useTheme();

    if (!open) {
        return (
            <View style={styles.showButton}>
                <IconButton
                    icon="chevron-right"
                    size={20}
                    style={styles.icon}
                    onPress={() => setOpen(true)}
                />
            </View>
        );
    }

    return (
        <Surface style={[styles.nav, {width: 60, borderColor: theme.colors.outlineVariant}]} elevation={2}>
            <IconButton
                icon="chevron-left"
                size={20}
                style={[styles.toggle, styles.icon]}
                onPress={() => setOpen(false)}
            />
            <Drawer.Section style={{flex: 1}}>
                {items.map(item => (
                    <Tooltip key={item.key} title={item.label}>
                        <IconButton
                            icon={item.icon}
                            size={20}
                            style={styles.icon}
                            onPress={() => navigate(item.key)}
                        />
                    </Tooltip>
                ))}
            </Drawer.Section>
            <View style={styles.userMenu}>
                <IconButton
                    icon="cog"
                    size={20}
                    style={styles.icon}
                    onPress={() => navigate('settings')} title="Settings"
                />
                <IconButton
                    icon="logout"
                    size={20}
                    style={styles.icon}
                    onPress={onLogout} title="Log Out"
                />
            </View>
        </Surface>
    );
}

const styles = StyleSheet.create({
    nav: {
        padding: 5,
        borderRightWidth: 1,
    },
    toggle: {
        alignSelf: 'flex-end',
    },
    userMenu: {
        alignItems: 'center',
        marginBottom: 8,
    },
    showButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    icon: {
        margin: 0,
    },
});
