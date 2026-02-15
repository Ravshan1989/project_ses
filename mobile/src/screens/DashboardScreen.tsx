import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert
} from 'react-native';
import { authApi } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import {
    User,
    Activity,
    FileText,
    ChevronRight,
    LogOut,
    Shield,
    Thermometer,
    Stethoscope
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Profile fetch error:', error);
            Alert.alert('Xatolik', 'Profil ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                <ActivityIndicator size="large" color="#38bdf8" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Background Decoration */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <User color="#fff" size={28} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.welcomeText}>Xush kelibsiz,</Text>
                            <Text style={styles.userName}>{user?.username || 'Foydalanuvchi'}</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutBtn}>
                            <LogOut color="#ef4444" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.orgBadge}>
                        <Shield size={14} color="#38bdf8" style={{ marginRight: 6 }} />
                        <Text style={styles.orgName}>
                            {user?.organization?.name || 'Tashkilot aniqlanmadi'}
                        </Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                            <Activity color="#38bdf8" size={24} />
                        </View>
                        <Text style={styles.statValue}>15</Text>
                        <Text style={styles.statLabel}>Bugungi hisobot</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                            <FileText color="#4ade80" size={24} />
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Tasdiqlangan</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Tezkor amallar</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Hisobotlar', { screen: 'ReportEntry', params: { type: 'ari', title: "SARI hisoboti" } })}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
                        <Thermometer color="#fb923c" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>SARI hisoboti</Text>
                        <Text style={styles.actionDesc}>O'tkir respirator infeksiya</Text>
                    </View>
                    <View style={styles.actionArrow}>
                        <ChevronRight color="#94a3b8" size={20} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Hisobotlar', { screen: 'ReportEntry', params: { type: 'ari', title: "O'RVI hisoboti" } })}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
                        <Stethoscope color="#a78bfa" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>O'RVI hisoboti</Text>
                        <Text style={styles.actionDesc}>Virusli kasalliklar</Text>
                    </View>
                    <View style={styles.actionArrow}>
                        <ChevronRight color="#94a3b8" size={20} />
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate-900
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    // Background Circles
    circle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#1e3a8a', // Blue-900
        opacity: 0.3,
    },
    circle2: {
        position: 'absolute',
        top: 150,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#1e293b', // Slate-800
        opacity: 0.4,
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    header: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)', // Glass effect
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#38bdf8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    userInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f8fafc',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
    },
    orgBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    orgName: {
        fontSize: 13,
        color: '#bae6fd',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        width: '48%',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f8fafc',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 16,
        marginLeft: 4,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 12,
        color: '#64748b',
    },
    actionArrow: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DashboardScreen;
