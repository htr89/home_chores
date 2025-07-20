import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Drawer, IconButton, Tooltip, Menu } from 'react-native-paper';

export default function NavigationBar({ navigate, open, setOpen, onLogout }) {
    const items = [
        {key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard'},
        {key: 'create', label: 'Add Task', icon: 'plus'},
        {key: 'list', label: 'Task List', icon: 'format-list-bulleted'},
        {key: 'users', label: 'Users', icon: 'account-group'},
        {key: 'calendar', label: 'Calendar', icon: 'calendar'},
    ];

    const [menuOpen, setMenuOpen] = React.useState(false);

    if (!open) {
        return (
            <View style={styles.showButton}>
                <IconButton icon="chevron-right" onPress={() => setOpen(true)} />
            </View>
        );
    }

    return (
        <View style={[styles.nav, {width: 70}]}> 
            <IconButton
                icon="chevron-left"
                onPress={() => setOpen(false)}
                style={styles.toggle}
            />
            <Drawer.Section style={{flex: 1}}>
                {items.map(item => (
                    <Tooltip key={item.key} title={item.label}>
                        <IconButton
                            icon={item.icon}
                            onPress={() => navigate(item.key)}
                        />
                    </Tooltip>
                ))}
            </Drawer.Section>
            <View style={styles.userMenu}>
                <Menu
                    visible={menuOpen}
                    onDismiss={() => setMenuOpen(false)}
                    anchor={
                        <IconButton
                            icon="account-circle"
                            size={24}
                            onPress={() => setMenuOpen(true)}
                        />
                    }
                >
                    <Menu.Item leadingIcon="cog" onPress={() => { setMenuOpen(false); navigate('settings'); }} title="Settings" />
                    <Menu.Item leadingIcon="logout" onPress={onLogout} title="Log Out" />
                </Menu>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    nav: {
        padding: 10,
        backgroundColor: '#fff',
        borderRightWidth: 1,
        borderColor: '#ddd',
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
});
