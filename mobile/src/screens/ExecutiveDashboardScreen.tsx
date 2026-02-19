import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    Modal,
    RefreshControl
} from 'react-native';
import { analysisApi } from '../services/api';
import {
    Activity,
    Shield,
    Flame,
    Bell,
    MapPin,
    TrendingUp,
    TrendingDown,
    X,
    ChevronRight,
    BarChart2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ExecutiveDashboardScreen = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
    const [districtDetails, setDistrictDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchData = async () => {
        try {
            const response = await analysisApi.getExecutiveSummary();
            setData(response.data);
        } catch (error) {
            console.error('Executive summary fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchDistrictDetails = async (id: string) => {
        setLoadingDetails(true);
        try {
            const response = await analysisApi.getDistrictDetails(id);
            setDistrictDetails(response.data);
        } catch (error) {
            console.error('District details fetch error:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return '#22c55e';
            case 'warning': return '#f59e0b';
            case 'critical': return '#ef4444';
            default: return '#3b82f6';
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#38bdf8" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Rahbar Paneli</Text>
                    <Text style={styles.subtitle}>Viloyat bo'yicha tezkor svodka</Text>
                </View>

                {/* KPI Section */}
                <View style={styles.kpiRow}>
                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                            {data?.trend === 'increasing' ? <TrendingUp color="#ef4444" size={20} /> : <TrendingDown color="#22c55e" size={20} />}
                        </View>
                        <Text style={styles.kpiValue}>{data?.totalCasesToday || 0}</Text>
                        <Text style={styles.kpiLabel}>Bugungi kasalliklar</Text>
                        <Text style={[styles.kpiTrend, { color: data?.trend === 'increasing' ? '#ef4444' : '#22c55e' }]}>
                            {data?.trendPercent || 0}% o'zgarish
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                            <Activity color={getStatusColor(data?.epidemicStatus)} size={20} />
                        </View>
                        <Text style={[styles.kpiValue, { color: getStatusColor(data?.epidemicStatus) }]}>
                            {data?.epidemicStatus === 'safe' ? 'Barqaror' : data?.epidemicStatus === 'warning' ? 'Xavf' : 'Kritik'}
                        </Text>
                        <Text style={styles.kpiLabel}>Epidemik holat</Text>
                    </View>
                </View>

                {/* Top 5 Hotspots Section */}
                {data?.topHotspots && data.topHotspots.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={styles.sectionTitle}>Eng Faol Hududlar (Top 5)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 4 }}>
                            {data.topHotspots.map((hotspot: any, index: number) => (
                                <View key={index} style={styles.hotspotCardHorizontal}>
                                    <View style={styles.hotspotHeader}>
                                        <View style={styles.rankBadge}>
                                            <Text style={styles.rankText}>#{index + 1}</Text>
                                        </View>
                                        <Flame color="#ef4444" size={20} />
                                    </View>
                                    <Text style={styles.hotspotNameHorizontal} numberOfLines={1}>{hotspot.name}</Text>
                                    <Text style={styles.hotspotCases}>{hotspot.cases} ta holat</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Latest Reports Section */}
                {data?.latestReports && data.latestReports.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={styles.sectionTitle}>So'nggi Xabarlar</Text>
                        <View style={styles.latestReportsContainer}>
                            {data.latestReports.map((report: any, index: number) => (
                                <View key={index} style={styles.latestReportItem}>
                                    <View style={[styles.reportIconBox, { backgroundColor: report.type === 'covid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)' }]}>
                                        {report.type === 'covid' ? <Activity size={18} color="#22c55e" /> : <Activity size={18} color="#38bdf8" />}
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.reportDiseaseName}>{report.diseaseName}</Text>
                                        <Text style={styles.reportDistrictName}>{report.district}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.reportTime}>{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                        <Text style={styles.reportDate}>{new Date(report.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Districts Grid */}
                <Text style={styles.sectionTitle}>Hududlar Nazorati</Text>
                <View style={styles.districtsGrid}>
                    {data?.districtStatuses?.map((district: any) => (
                        <TouchableOpacity
                            key={district.id}
                            style={[styles.districtCard, { borderTopColor: getStatusColor(district.status) }]}
                            onPress={() => {
                                setSelectedDistrict(district);
                                fetchDistrictDetails(district.id);
                            }}
                        >
                            <Text style={styles.districtName} numberOfLines={1}>{district.name}</Text>
                            <View style={[styles.districtBadge, { backgroundColor: getStatusColor(district.status) }]}>
                                <Text style={styles.districtCases}>{district.cases}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Top Diseases */}
                <Text style={styles.sectionTitle}>Top 5 Kasalliklar</Text>
                <View style={styles.diseaseList}>
                    {data?.topDiseases?.map((disease: any, index: number) => (
                        <View key={index} style={styles.diseaseItem}>
                            <View style={styles.diseaseRank}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <Text style={styles.diseaseNameText}>{disease.name}</Text>
                            <Text style={styles.diseaseCount}>{disease.count}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Drill-down Modal */}
            <Modal
                visible={!!selectedDistrict}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedDistrict(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MapPin color="#38bdf8" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.modalTitle}>{selectedDistrict?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedDistrict(null)}>
                                <X color="#94a3b8" size={24} />
                            </TouchableOpacity>
                        </View>

                        {loadingDetails ? (
                            <ActivityIndicator style={{ margin: 40 }} color="#38bdf8" />
                        ) : districtDetails ? (
                            <View style={{ padding: 20 }}>
                                <Text style={styles.modalSubTitle}>Tumandagi asosiy kasalliklar:</Text>
                                {districtDetails.topDiseases?.map((d: any, i: number) => (
                                    <View key={i} style={styles.modalListItem}>
                                        <Text style={styles.modalItemName}>{i + 1}. {d.name}</Text>
                                        <Text style={styles.modalItemValue}>{d.count} ta holat</Text>
                                    </View>
                                ))}
                                {districtDetails.topDiseases?.length === 0 && (
                                    <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 20 }}>Ma'lumot topilmadi</Text>
                                )}
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setSelectedDistrict(null)}
                        >
                            <Text style={styles.modalCloseBtnText}>Yopish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    content: { padding: 16 },
    header: { marginBottom: 24, marginTop: 10 },
    title: { fontSize: 28, fontWeight: '800', color: '#f8fafc' },
    subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
    kpiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    kpiCard: { width: '48%', backgroundColor: '#1e293b', borderRadius: 20, padding: 16, borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
    kpiIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    kpiValue: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
    kpiLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    kpiTrend: { fontSize: 11, fontWeight: '600', marginTop: 8 },
    hotspotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    hotspotInfo: { flex: 1, marginLeft: 12 },
    hotspotTitle: { fontSize: 12, color: '#fca5a5' },
    hotspotName: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
    hotspotValueBox: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
    hotspotValue: { color: '#fff', fontWeight: '800' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 16, marginTop: 8 },
    districtsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    districtCard: {
        width: '31%',
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderTopWidth: 4
    },
    districtName: { fontSize: 12, fontWeight: '600', color: '#cbd5e1', marginBottom: 8 },
    districtBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    districtCases: { color: '#fff', fontWeight: '800', fontSize: 14 },
    diseaseList: { backgroundColor: '#1e293b', borderRadius: 20, padding: 10, marginBottom: 30 },
    diseaseItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    diseaseRank: { width: 40, height: 30, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { color: '#38bdf8', fontWeight: '700', fontSize: 12 },
    diseaseNameText: { flex: 1, color: '#f1f5f9', fontWeight: '500' },
    diseaseCount: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 30, borderTopRightRadius: 30, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
    modalSubTitle: { fontSize: 16, fontWeight: '600', color: '#94a3b8', marginBottom: 16 },
    modalListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    modalItemName: { color: '#f1f5f9', fontSize: 16 },
    modalItemValue: { color: '#ef4444', fontWeight: '700' },
    modalCloseBtn: { margin: 20, backgroundColor: '#334155', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    modalCloseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    // New Styles for Top 5 & Latest Reports
    hotspotCardHorizontal: {
        width: 160,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    hotspotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    rankBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    hotspotNameHorizontal: {
        color: '#f8fafc',
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4
    },
    hotspotCases: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 12
    },
    latestReportsContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 10
    },
    latestReportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    reportIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reportDiseaseName: {
        color: '#f1f5f9',
        fontWeight: '600',
        fontSize: 14
    },
    reportDistrictName: {
        color: '#94a3b8',
        fontSize: 12
    },
    reportTime: {
        color: '#f8fafc',
        fontWeight: '700',
        fontSize: 12
    },
    reportDate: {
        color: '#64748b',
        fontSize: 10
    }
});

export default ExecutiveDashboardScreen;
