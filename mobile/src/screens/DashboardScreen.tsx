import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { authApi } from '../services/api';
import { User, Activity, FileText, ChevronRight } from 'lucide-react-native';

const DashboardScreen = () => {
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
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1677ff" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <User color="#fff" size={32} />
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Xush kelibsiz,</Text>
                        <Text style={styles.userName}>{user?.username || 'Foydalanuvchi'}</Text>
                    </View>
                </View>
                <Text style={styles.orgName}>{user?.organization?.name || 'Tashkilot nomi'}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Activity color="#1677ff" size={24} />
                    <Text style={styles.statValue}>---</Text>
                    <Text style={styles.statLabel}>Bugungi hisobotlar</Text>
                </View>
                <View style={styles.statCard}>
                    <FileText color="#52c41a" size={24} />
                    <Text style={styles.statValue}>---</Text>
                    <Text style={styles.statLabel}>Tasdiqlanganlar</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Tezkor amallar</Text>
            <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionLeft}>
                    <View style={[styles.actionIcon, { backgroundColor: '#e6f4ff' }]}>
                        <FileText color="#1677ff" size={20} />
                    </View>
                    <Text style={styles.actionText}>SARI hisobotini yuborish</Text>
                </View>
                <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
                <View style={styles.actionLeft}>
                    <View style={[styles.actionIcon, { backgroundColor: '#f6ffed' }]}>
                        <Activity color="#52c41a" size={20} />
                    </View>
                    <Text style={styles.actionText}>O'RVI hisobotini yuborish</Text>
                </View>
                <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1677ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    welcomeText: {
        fontSize: 14,
        color: '#64748b',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    orgName: {
        fontSize: 14,
        color: '#475569',
        fontStyle: 'italic',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    actionButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
});

export default DashboardScreen;
