import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { LogOut, User, Settings, Info } from 'lucide-react-native';
import { removeToken } from '../services/auth';
import * as Application from 'expo-application';

const ProfileScreen = ({ onLogout }: { onLogout: () => void }) => {
    const handleLogout = () => {
        Alert.alert(
            'Chiqish',
            'Tizimdan chiqishni xohlaysizmi?',
            [
                { text: 'Bekor qilish', style: 'cancel' },
                {
                    text: 'Chiqish',
                    style: 'destructive',
                    onPress: async () => {
                        await removeToken();
                        onLogout();
                    }
                },
            ]
        );
    };

    const showAbout = () => {
        const currentVersion = Application.nativeApplicationVersion || '1.0.0';
        const lastUpdate = '2026-02-15';
        Alert.alert(
            'Ilova haqida',
            `Versiya: ${currentVersion}\nYangilangan sana: ${lastUpdate}\n\nRespublika SES Markazi uchun maxsus ishlab chiqilgan.`,
            [{ text: 'Tushunarli' }]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#e6f4ff' }]}>
                            <User color="#1677ff" size={20} />
                        </View>
                        <Text style={styles.menuText}>Shaxsiy ma'lumotlar</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f0f5ff' }]}>
                            <Settings color="#1677ff" size={20} />
                        </View>
                        <Text style={styles.menuText}>Sozlamalar</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={showAbout}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f5f5f5' }]}>
                            <Info color="#64748b" size={20} />
                        </View>
                        <Text style={styles.menuText}>Ilova haqida</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={handleLogout}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#fff1f0' }]}>
                            <LogOut color="#ff4d4f" size={20} />
                        </View>
                        <Text style={[styles.menuText, { color: '#ff4d4f' }]}>Tizimdan chiqish</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    menu: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1e293b',
    },
    logoutBtn: {
        borderBottomWidth: 0,
    },
});

export default ProfileScreen;
