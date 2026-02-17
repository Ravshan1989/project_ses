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
    const [onlyPending, setOnlyPending] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [date]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const [ari, covid, flu, epi, diarrhea, hep] = await Promise.all([
                dailyReportsApi.getAriByDate(date).catch(() => ({ data: [] })),
                dailyReportsApi.getCovidByDate(date).catch(() => ({ data: [] })),
                dailyReportsApi.getFluByDate(date).catch(() => ({ data: [] })),
                dailyReportsApi.getEpidemiologyByDate(date).catch(() => ({ data: [] })),
                dailyReportsApi.getDiarrheaByDate(date).catch(() => ({ data: [] })),
                dailyReportsApi.getByDate(date).catch(() => ({ data: [] })), // Hepatitis
            ]);

            const combined = [
                ...ari.data.map((r: any) => ({ ...r, type: 'ari', title: "O'RVI" })),
                ...covid.data.map((r: any) => ({ ...r, type: 'covid', title: "Covid-19" })),
                ...flu.data.map((r: any) => ({ ...r, type: 'flu', title: "Gripp/Pnevmoniya" })),
                ...epi.data.map((r: any) => ({ ...r, type: 'epidemiology', title: "Epidemiologiya" })),
                ...diarrhea.data.map((r: any) => ({ ...r, type: 'diarrhea', title: "O'tkir Diareya" })),
                ...hep.data.map((r: any) => ({ ...r, type: 'hepatitis', title: "Virusli Gepatit" })),
            ];

            // Sort by creation time (newest first)
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
                <View style={styles.dateInfo}>
                    <Calendar color="#64748b" size={20} />
                    <Text style={styles.dateText}>{date}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.pendingFilterBtn, onlyPending && styles.activeFilter]}
                    onPress={() => setOnlyPending(!onlyPending)}
                >
                    <Filter color={onlyPending ? "#fff" : "#3b82f6"} size={18} />
                    <Text style={[styles.pendingFilterText, onlyPending && { color: '#fff' }]}>Kutilmoqda</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={onlyPending ? reports.filter(r => r.status === 'SUBMITTED') : reports}
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
    dateInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    dateText: { marginLeft: 12, fontSize: 16, color: '#1e293b', fontWeight: '500' },
    filterBtn: { padding: 4 },
    pendingFilterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#bfdbfe'
    },
    activeFilter: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
    pendingFilterText: { marginLeft: 6, fontSize: 12, color: '#3b82f6', fontWeight: '600' },
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
