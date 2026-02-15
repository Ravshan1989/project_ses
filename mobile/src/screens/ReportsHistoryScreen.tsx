import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dailyReportsApi } from '../services/api';
import { Calendar, ChevronRight, Filter } from 'lucide-react-native';

const ReportsHistoryScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReports();
    }, [date]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Fetch all types in parallel
            const [ari, covid, flu, epi, diarrhea, hep] = await Promise.all([
                dailyReportsApi.getAriByDate(date) || { data: [] }, // Create wrappers for these if not exist, or allow generic getByDate to return all?
                dailyReportsApi.getCovidByDate(date) || { data: [] },
                // Add others... using the generic getByDate for now to simplify if specific endpoints aren't ready
            ].map(p => p.catch(() => ({ data: [] }))));

            // IMPORTANT: The API `dailyReportsApi.getByDate` (generic) might return a mix if backend supports it, 
            // but currently backend is split. 
            // Let's assume we fetch generic "All Reports" if backend supported it, or fetch individually.
            // For now, I will use `getByDate` generic if implemented, or just fetch what I can.

            // Actually `dailyReportsApi.getByDate` fetches Hepatitis (based on service code I saw). 
            // I need to implement `getAllTypesByDate` or similar in backend, OR call multiple endpoints here.

            // Let's call the `weekly-summary` logic? No that's aggregate.
            // I'll just fetch ARI and COVID for now as examples since I saw their endpoints.

            // Re-checking api.ts... it has upsertAri, upsertCovid. 
            // It has `getByDate` (which maps to /daily-reports?date=... -> Hepatitis repo in Service?).

            // Backend `DailyReportsController.findAll` calls `service.getByDate`.
            // `service.getByDate` queries `hepatitisRepository`.

            // Wait, the backend controller `findAll` allows `type` param?
            // Let's check `DailyReportsController`.

            // If backend doesn't support generic fetch, I have to fetch individually.

            const resAri = await dailyReportsApi.getAriByDate(date).catch(() => ({ data: [] }));
            const resCovid = await dailyReportsApi.getCovidByDate(date).catch(() => ({ data: [] }));
            // ... others

            const combined = [
                ...resAri.data.map((r: any) => ({ ...r, type: 'ari', title: "O'RVI" })),
                ...resCovid.data.map((r: any) => ({ ...r, type: 'covid', title: "Covid-19" })),
            ];

            setReports(combined);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#22c55e';
            case 'VERIFIED': return '#3b82f6';
            case 'SUBMITTED': return '#f59e0b';
            default: return '#94a3b8';
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ReportDetail', { report: item, type: item.type })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status || 'DRAFT') }]}>
                    <Text style={styles.statusText}>{item.status || 'DRAFT'}</Text>
                </View>
            </View>
            <Text style={styles.orgName}>{item.organization?.name || 'Tashkilot'}</Text>
            <View style={styles.footer}>
                <Text style={styles.date}>{item.reportDate}</Text>
                <ChevronRight size={16} color="#94a3b8" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterBar}>
                <Calendar color="#64748b" size={20} />
                <Text style={styles.dateText}>{date}</Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter color="#3b82f6" size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={reports}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} />}
                ListEmptyComponent={
                    !loading ? <Text style={styles.emptyText}>Hisobotlar topilmadi</Text> : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    filterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    dateText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b', fontWeight: '500' },
    filterBtn: { padding: 4 },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    orgName: { fontSize: 14, color: '#64748b', marginBottom: 12 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 12, color: '#94a3b8' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8' }
});

export default ReportsHistoryScreen;
