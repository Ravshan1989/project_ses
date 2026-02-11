import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { FileText, ChevronRight, Thermometer, ShieldCheck, HeartPulse, ClipboardList } from 'lucide-react-native';

const REPORT_TYPES = [
    { id: 'ari', title: "O'RVI (Ari)", icon: <Thermometer color="#1677ff" size={24} />, color: '#e6f4ff' },
    { id: 'sari', title: 'SARI (Og\'ir respirator)', icon: <HeartPulse color="#ff4d4f" size={24} />, color: '#fff1f0' },
    { id: 'covid', title: 'Koronavirus (Covid)', icon: <ShieldCheck color="#52c41a" size={24} />, color: '#f6ffed' },
    { id: 'hepatitis', title: 'Virusli Gepatit A', icon: <Activity color="#722ed1" size={24} />, color: '#f9f0ff' },
    { id: 'epidemiology', title: 'Epidemiologiya', icon: <ClipboardList color="#faad14" size={24} />, color: '#fffbe6' },
];

import { Activity } from 'lucide-react-native';

const ReportListScreen = () => {
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    {item.icon}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <ChevronRight color="#94a3b8" size={20} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={REPORT_TYPES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <Text style={styles.headerTitle}>Yuborish uchun hisobot turini tanlang</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listContent: {
        padding: 20,
    },
    headerTitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 20,
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
});

export default ReportListScreen;
