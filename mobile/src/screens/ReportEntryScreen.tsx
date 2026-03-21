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
    Platform,
    LayoutAnimation,
    UIManager
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { dailyReportsApi, authApi } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { Save, ArrowLeft, Calendar, ChevronDown, ChevronUp } from 'lucide-react-native';
import { REPORT_CONFIG, SectionDef, FieldDef } from '../constants/reportConfig';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}


const ReportEntryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { type, title, existingReport } = route.params;

    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState<any>({
        reportDate: existingReport?.reportDate || new Date().toISOString().split('T')[0],
        ...existingReport
    });
    // Section collapse state (default: all open)
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const canEdit = () => {
        if (!existingReport) return true;
        const status = existingReport.status || 'DRAFT';
        if (status === 'APPROVED' || status === 'VERIFIED') return false;

        const role = profile?.role;
        // Specialists/Staff who can create and edit drafts
        const isSpecialist = [
            'STAFF', 
            'DISTRICT_SPECIALIST', 
            'DISTRICT_OPERATOR',
            'SANITARY_SPECIALIST', 
            'SANITARY_OPERATOR',
            'LEAD_SPECIALIST'
        ].includes(role);
        
        // Heads who can verify/approve (and thus edit if submitted)
        const isMudir = [
            'DEPARTMENT_HEAD', 
            'LAB_HEAD', 
            'DISTRICT_HEAD',
            'SANITARY_HEAD'
        ].includes(role);

        if (isSpecialist) return status === 'DRAFT' || status === 'REJECTED';
        if (isMudir) return status === 'SUBMITTED';
        return true; // Admin can edit
    };

    useEffect(() => {
        fetchProfile();
        // Initialize open sections
        const config = REPORT_CONFIG[type] || [];
        const initialOpenState: Record<string, boolean> = {};
        config.forEach((s, i) => initialOpenState[i] = true);
        setOpenSections(initialOpenState);
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setProfile(response.data);
        } catch (error) {
            Alert.alert('Xatolik', 'Profilni yuklab bo\'lmadi');
        }
    };

    const toggleSection = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenSections(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleSave = async () => {
        if (!profile?.organization?.id) {
            Alert.alert('Xatolik', 'Tashkilot aniqlanmadi');
            return;
        }

        // Numeric validation
        const invalidFields = Object.keys(form).filter(key => {
            if (key === 'reportDate' || key === 'organizationId' || key === 'status' || key === 'id' || key === 'createdAt') return false;
            const val = form[key];
            return val !== '' && isNaN(Number(val));
        });

        if (invalidFields.length > 0) {
            Alert.alert('Xatolik', 'Iltimos, faqat raqamlarni kiriting');
            return;
        }

        setLoading(true);
        try {
            let data: any = {
                reportDate: form.reportDate,
                organizationId: profile?.organization?.id,
                ...form // Spread all form data
            };

            // Ensure numbers are converted
            Object.keys(data).forEach(key => {
                if (!['reportDate', 'organizationId', 'status', 'id', 'createdAt'].includes(key)) {
                    data[key] = Number(data[key]) || 0;
                }
            });

            if (type === 'ari') await dailyReportsApi.upsertAri(data);
            else if (type === 'flu') await dailyReportsApi.upsertFlu(data);
            else if (type === 'covid') await dailyReportsApi.upsertCovid(data);
            else if (type === 'hepatitis') await dailyReportsApi.upsertHepatitis(data);
            else if (type === 'epidemiology') await dailyReportsApi.upsertEpidemiology(data);
            else if (type === 'diarrhea') await dailyReportsApi.upsertDiarrhea(data);
            else await dailyReportsApi.upsert(data); // Fallback

            Alert.alert('Muvaffaqiyat', 'Hisobot yuborildi', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Report submission error:', error);
            const msg = error.response?.data?.message || 'Serverga ulanib bo\'lmadi';

            Alert.alert(
                'Xatolik',
                `${msg}. Hisobotni telefon xotirasida saqlab turaymi?`,
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
                            Alert.alert('Saqlandi', 'Hisobot offline saqlandi.');
                            navigation.goBack();
                        }
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (def: FieldDef) => {
        const editable = canEdit();
        return (
            <View key={def.key} style={styles.inputGroup}>
                <Text style={styles.label}>{def.label}</Text>
                <TextInput
                    style={[styles.input, !editable && { backgroundColor: '#f8fafc', color: '#64748b' }]}
                    value={form[def.key]?.toString()}
                    onChangeText={(val) => editable && setForm({ ...form, [def.key]: val })}
                    keyboardType="numeric"
                    placeholder={def.placeholder || '0'}
                    placeholderTextColor="#94a3b8"
                    editable={editable}
                />
            </View>
        );
    };

    const renderSection = (section: SectionDef, index: number) => {
        const isOpen = openSections[index];
        return (
            <View key={index} style={styles.sectionCard}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(index)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {isOpen ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                </TouchableOpacity>

                {isOpen && (
                    <View style={styles.sectionContent}>
                        {section.fields.map(renderInput)}
                    </View>
                )}
            </View>
        );
    };

    const config = REPORT_CONFIG[type] || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Date Selection */}
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Hisobot Sanasi</Text>
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
                    </View>

                    {/* Dynamic Sections */}
                    {config.length > 0 ? (
                        config.map((s, i) => renderSection(s, i))
                    ) : (
                        <View style={styles.card}>
                            <Text style={{ textAlign: 'center', color: '#94a3b8' }}>
                                Bu hisobot turi uchun shakl topilmadi.
                            </Text>
                        </View>
                    )}

                    {canEdit() && (
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
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    sectionContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    inputGroup: { marginBottom: 16 },
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
