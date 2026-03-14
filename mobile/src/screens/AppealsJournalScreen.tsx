import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { appealsApi, authApi } from '../services/api';
import { Plus, ListFilter, ClipboardList, ChevronRight } from 'lucide-react-native';
import dayjs from 'dayjs';

const AppealsJournalScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [records, setRecords] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));

    const fetchData = async () => {
        try {
            const [profileRes, recordsRes, reportsRes] = await Promise.all([
                authApi.getProfile(),
                appealsApi.getRecords(month),
                appealsApi.getAutoReports(month)
            ]);
            
            setProfile(profileRes.data);
            setRecords(recordsRes.data);
            setStats(reportsRes.data);
        } catch (error) {
            console.error('Appeals fetch error:', error);
            Alert.alert('Xatolik', 'Ma\'lumotlarni yuklab bo\'lmadi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [month])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const renderHeader = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Jami</Text>
                <Text style={styles.statValue}>{stats?.records_count || 0}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
                <Text style={styles.statLabel}>Shikoyatlar</Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                    {(stats?.table5?.phys_shikoyat_curr || 0) + (stats?.table5?.legal_shikoyat_curr || 0)}
                </Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
                <Text style={styles.statLabel}>Arizalar</Text>
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                    {(stats?.table5?.phys_ariza_curr || 0) + (stats?.table5?.legal_ariza_curr || 0)}
                </Text>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.recordCard}
            onPress={() => navigation.navigate('AppealEntry', { existingRecord: item, title: 'Tahrirlash' })}
        >
            <View style={styles.recordHeader}>
                <View style={styles.recordTypeTag}>
                    <Text style={styles.recordTypeText}>{item.appeal_type}</Text>
                </View>
                <Text style={styles.recordDate}>{item.registration_date}</Text>
            </View>
            <Text style={styles.applicantName} numberOfLines={1}>{item.applicant_name}</Text>
            <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
            <View style={styles.recordFooter}>
                <Text style={styles.statusText}>{item.status}</Text>
                <ChevronRight size={16} color="#94a3b8" />
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1677ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={records}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1677ff']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ClipboardList size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Murojaatlar hali kiritilmagan</Text>
                    </View>
                }
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('AppealEntry', { title: 'Yangi Murojaat' })}
            >
                <Plus color="#fff" size={24} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16, paddingBottom: 100 },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    statCard: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    recordCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    recordTypeTag: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    recordTypeText: { fontSize: 11, fontWeight: '600', color: '#3b82f6' },
    recordDate: { fontSize: 12, color: '#94a3b8' },
    applicantName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    summary: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    recordFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 8 },
    statusText: { fontSize: 12, fontWeight: '600', color: '#10b981' },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#1677ff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { marginTop: 12, fontSize: 14, color: '#94a3b8' },
});

export default AppealsJournalScreen;
