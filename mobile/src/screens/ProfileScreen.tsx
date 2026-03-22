import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { RefreshCw, LogOut, User, Settings, Info, ChevronRight } from 'lucide-react-native';
import { removeToken } from '../services/auth';
import { versionApi } from '../services/api';

const ProfileScreen = ({ onLogout, user }: { onLogout: () => void; user: any }) => {
    const [updating, setUpdating] = useState(false);

    const onCheckUpdate = async () => {
        setUpdating(true);
        try {
            // 1. Check Backend Version first
            const response = await versionApi.getLatest();
            const latest = response.data;
            const currentVersion = Application.nativeApplicationVersion || '1.1.0';

            if (latest.version !== currentVersion) {
                Alert.alert(
                    'Yangi talqin mavjud',
                    `Ilovaning yangi ${latest.version} talqini chiqdi.\n\nYangilanishlar: ${latest.notes}`,
                    [
                        { text: 'Keyinroq', style: 'cancel' },
                        {
                            text: 'Yuklab olish',
                            onPress: () => {
                                Alert.alert('Yuklash', `Iltimos, yangi APK faylni mana bu manzildan yuklab oling:\n\n${latest.downloadUrl}`);
                            }
                        }
                    ]
                );
                return;
            }

            // 2. Fallback to Expo Updates if version matches
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    'OTA Yangilanish mavjud',
                    'Ilova uchun tezkor yangilanish topildi. Yuklaymizmi?',
                    [
                        { text: 'Yo\'q', style: 'cancel' },
                        {
                            text: 'Ha',
                            onPress: async () => {
                                await Updates.fetchUpdateAsync();
                                await Updates.reloadAsync();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Yangilanishlar', 'Siz eng oxirgi talqindagi ilovadan foydalanyapsiz.');
            }
        } catch (error) {
            console.error('Update check error:', error);
            Alert.alert('Xatolik', 'Yangilanishlarni tekshirib bo\'lmadi. Internetni tekshiring.');
        } finally {
            setUpdating(false);
        }
    };

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

    const showPersonalInfo = () => {
        if (!user) {
            Alert.alert('Xatolik', 'Ma\'lumotlar yuklanmagan');
            return;
        }
        Alert.alert(
            'Shaxsiy ma\'lumotlar',
            `Foydalanuvchi: ${user.fullName || user.username}\nRol: ${user.role}\nTashkilot: ${user.organization?.name || 'Noma\'lum'}`,
            [{ text: 'Yopish' }]
        );
    };

    const showSettings = () => {
        Alert.alert('Sozlamalar', 'Ushbu bo\'lim hozirda ishlab chiqilmoqda (Tez kunda...).', [{ text: 'Tushunarli' }]);
    };

    const showAbout = () => {
        const currentVersion = Application.nativeApplicationVersion || '1.1.0';
        const lastUpdate = '2026-03-21';
        Alert.alert(
            'Ilova haqida',
            `Versiya: ${currentVersion}\nYangilangan sana: ${lastUpdate}\n\nRespublika SES Markazi uchun maxsus ishlab chiqilgan.`,
            [{ text: 'Tushunarli' }]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.userName}>{user?.fullName || 'Foydalanuvchi'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Xodim'}</Text>
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={showPersonalInfo}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#e6f4ff' }]}>
                            <User color="#1677ff" size={20} />
                        </View>
                        <Text style={styles.menuText}>Shaxsiy ma'lumotlar</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={showSettings}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f0f5ff' }]}>
                            <Settings color="#1677ff" size={20} />
                        </View>
                        <Text style={styles.menuText}>Sozlamalar</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onCheckUpdate} disabled={updating}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                            {updating ? (
                                <ActivityIndicator size="small" color="#22c55e" />
                            ) : (
                                <RefreshCw color="#22c55e" size={20} />
                            )}
                        </View>
                        <Text style={styles.menuText}>Yangilanishlarni tekshirish</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={showAbout}>
                    <View style={styles.menuLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#f5f5f5' }]}>
                            <Info color="#64748b" size={20} />
                        </View>
                        <Text style={styles.menuText}>Ilova haqida</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        marginBottom: 20,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1677ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#1677ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    menu: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        borderRadius: 10,
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
