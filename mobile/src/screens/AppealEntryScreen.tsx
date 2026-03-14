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
import { appealsApi, authApi } from '../services/api';
import { Save, ArrowLeft, Calendar, User, FileText, ChevronDown } from 'lucide-react-native';
import dayjs from 'dayjs';

const AppealEntryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { title, existingRecord } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [form, setForm] = useState<any>({
        registration_date: existingRecord?.registration_date || dayjs().format('YYYY-MM-DD'),
        period_month: existingRecord?.period_month || dayjs().format('YYYY-MM'),
        applicant_name: existingRecord?.applicant_name || '',
        applicant_type: existingRecord?.applicant_type || 'PHYSICAL',
        channel: existingRecord?.channel || 'WRITTEN',
        appeal_type: existingRecord?.appeal_type || 'ARIZA',
        recipient: existingRecord?.recipient || 'head',
        subject_key: existingRecord?.subject_key || 'other',
        summary: existingRecord?.summary || '',
        resolution: existingRecord?.resolution || '',
        status: existingRecord?.status || 'BEING_CONSIDERED',
        consequence: existingRecord?.consequence || null,
        is_overdue: existingRecord?.is_overdue || false,
        is_repeated: existingRecord?.is_repeated || false,
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
        if (!form.applicant_name || !form.summary) {
            Alert.alert('Xatolik', 'Ism va mazmunni toldirish shart');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...form,
                organization_id: profile?.organization?.id,
            };

            await appealsApi.createRecord(data);
            Alert.alert('Muvaffaqiyat', 'Murojaat saqlandi', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Xatolik', error.response?.data?.message || 'Saqlashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, field: string, icon?: any, multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, multiline && { height: 100, alignItems: 'flex-start', paddingTop: 10 }]}>
                {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
                <TextInput
                    style={styles.input}
                    value={form[field]}
                    onChangeText={(val) => setForm({ ...form, [field]: val })}
                    placeholder={`${label}ni kiriting`}
                    multiline={multiline}
                />
            </View>
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

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <View style={styles.card}>
                        {renderInput('Murojaatchi Ismi', 'applicant_name', <User size={18} color="#64748b" />)}
                        
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Sana</Text>
                                <View style={styles.inputWrapper}>
                                    <Calendar size={18} color="#64748b" style={{ marginRight: 8 }} />
                                    <TextInput 
                                        style={styles.input} 
                                        value={form.registration_date} 
                                        onChangeText={(val) => setForm({ ...form, registration_date: val })}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Turi</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputText}>{form.appeal_type}</Text>
                                    <ChevronDown size={16} color="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        {renderInput('Murojaat Mazmuni', 'summary', <FileText size={18} color="#64748b" />, true)}
                        {renderInput('Xulosa / Qaror', 'resolution', null, true)}
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveBtn, loading && styles.disabledBtn]} 
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Save color="#fff" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>SAQLASH</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    scroll: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#e2e8f0' },
    input: { flex: 1, fontSize: 16, color: '#1e293b' },
    inputText: { flex: 1, fontSize: 16, color: '#1e293b' },
    row: { flexDirection: 'row' },
    saveBtn: { backgroundColor: '#1677ff', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    disabledBtn: { opacity: 0.6 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AppealEntryScreen;
