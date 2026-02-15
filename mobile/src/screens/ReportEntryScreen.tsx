import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { dailyReportsApi, authApi } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { Save, ArrowLeft, Calendar } from 'lucide-react-native';

const ReportEntryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { type, title } = route.params;

    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState<any>({
        reportDate: new Date().toISOString().split('T')[0],
        // Default common fields
        total_cases: '',
        hospitalized_count: '',
        // ARI specific
        ari: '',
        pneumonia: '',
        gk: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setProfile(response.data);
        } catch (error) {
            Alert.alert('Xatolik', 'Profilni yuklab bo\'lmadi');
        }
    };

    const handleSave = async () => {
        if (!profile?.organization?.id) {
            Alert.alert('Xatolik', 'Tashkilot aniqlanmadi');
            return;
        }

        setLoading(true);
        try {
            let data: any = {
                reportDate: form.reportDate,
                organizationId: profile.organization.id,
            };

            // Dynamic mapping based on type
            if (type === 'ari') {
                data = { ...data, ari: Number(form.ari) || 0, pneumonia: Number(form.pneumonia) || 0, gk: Number(form.gk) || 0 };
                await dailyReportsApi.upsertAri(data);
            } else if (type === 'covid') {
                data = { ...data, total_cases: Number(form.total_cases) || 0, hospitalized_count: Number(form.hospitalized_count) || 0 };
                await dailyReportsApi.upsertCovid(data);
            } else {
                // Default generic upsert
                data = { ...data, total_cases: Number(form.total_cases) || 0 };
                await dailyReportsApi.upsert(data);
            }

            Alert.alert('Muvaffaqiyat', 'Hisobot yuborildi', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Report submission error:', error);
            const msg = error.response?.data?.message || 'Serverga ulanib bo\'lmadi';

            Alert.alert(
                'Xatolik',
                `${msg}. Hisobotni telefon xotirasida saqlab turaymi? Keyinroq yuborishingiz mumkin.`,
                [
                    { text: 'Yo\'q', style: 'cancel' },
                    {
                        text: 'Saqlash',
                        onPress: async () => {
                            const dataToSave = {
                                reportDate: form.reportDate,
                                organizationId: profile.organization.id,
                                ...form
                            };
                            await offlineStorage.saveReport(type, dataToSave);
                            Alert.alert('Saqlandi', 'Hisobot offline saqlandi. Internet paydo bo\'lganda Asosiy sahifadan yuborishingiz mumkin.');
                            navigation.goBack();
                        }
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, key: string, placeholder = '0') => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={form[key]?.toString()}
                onChangeText={(val) => setForm({ ...form, [key]: val })}
                keyboardType="numeric"
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Sana (YYYY-MM-DD)</Text>
                        <View style={styles.dateWrapper}>
                            <Calendar size={18} color="#64748b" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.dateInput}
                                value={form.reportDate}
                                onChangeText={(val) => setForm({ ...form, reportDate: val })}
                                placeholder="2026-02-15"
                            />
                        </View>
                    </View>

                    {type === 'ari' ? (
                        <>
                            {renderInput('O\'RVI (ARI)', 'ari')}
                            {renderInput('Zotiljam (Pneumonia)', 'pneumonia')}
                            {renderInput('Grippg o\'xshash (GK)', 'gk')}
                        </>
                    ) : (
                        <>
                            {renderInput('Jami holatlar', 'total_cases')}
                            {renderInput('Shifoxonaga yotqizilgan', 'hospitalized_count')}
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.disabledBtn]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Save color="#fff" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>YUBORISH</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    scroll: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1e293b',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dateWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dateInput: { flex: 1, fontSize: 16, color: '#1e293b' },
    saveBtn: {
        backgroundColor: '#1677ff',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: { opacity: 0.6 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1 },
});

export default ReportEntryScreen;
