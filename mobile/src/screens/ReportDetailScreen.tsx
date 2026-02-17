import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { approvalApi, authApi } from '../services/api'; // Make sure this is updated
import { ArrowLeft, CheckCircle, CheckSquare, XCircle, Clock, ShieldCheck, User } from 'lucide-react-native';
import { getFieldLabel } from '../constants/reportConfig';

const ReportDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { report, type } = route.params; // Expect full report object and type
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(report.status || 'DRAFT');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Profile error:', error);
        }
    };

    const handleAction = async (action: 'submit' | 'verify' | 'approve' | 'reject') => {
        if (action === 'reject') {
            Alert.prompt(
                'Rad etish',
                'Rad etish sababini kiriting:',
                [
                    { text: 'Bekor qilish', style: 'cancel' },
                    {
                        text: 'Rad etish',
                        onPress: async (comment?: string) => {
                            setLoading(true);
                            try {
                                const res = await approvalApi.reject(type, report.id, comment);
                                if (res?.data) {
                                    setCurrentStatus('REJECTED');
                                    Alert.alert('Muvaffaqiyat', 'Hisobot rad etildi');
                                    navigation.goBack();
                                }
                            } catch (error: any) {
                                Alert.alert('Xatolik', error.response?.data?.message || 'Amalni bajarib bo\'lmadi');
                            } finally {
                                setLoading(false);
                            }
                        }
                    }
                ],
                'plain-text'
            );
            return;
        }

        setLoading(true);
        try {
            let res;
            if (action === 'submit') res = await approvalApi.submit(type, report.id);
            if (action === 'verify') res = await approvalApi.verify(type, report.id);
            if (action === 'approve') res = await approvalApi.approve(type, report.id);

            if (res?.data) {
                setCurrentStatus(res.data.status || (action === 'submit' ? 'SUBMITTED' : action === 'verify' ? 'VERIFIED' : 'APPROVED'));
                Alert.alert('Muvaffaqiyat', `Hisobot holati o'zgardi`);
                navigation.goBack();
            }
        } catch (error: any) {
            Alert.alert('Xatolik', error.response?.data?.message || 'Amalni bajarib bo\'lmadi');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#22c55e';
            case 'VERIFIED': return '#3b82f6';
            case 'SUBMITTED': return '#f59e0b';
            case 'REJECTED': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    const renderActionButtons = () => {
        if (!user) return null;
        const role = user.role;

        // 1. Submit (Owner) - If DRAFT or REJECTED
        if (currentStatus === 'DRAFT' || currentStatus === 'REJECTED') {
            return (
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#f59e0b' }]} onPress={() => handleAction('submit')}>
                    <Text style={styles.btnText}>YUBORISH (Mudirga)</Text>
                </TouchableOpacity>
            );
        }

        // 2. Verify (Dept Head) - If SUBMITTED
        if (role === 'DEPARTMENT_HEAD' && currentStatus === 'SUBMITTED') {
            return (
                <View style={styles.btnGroup}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#3b82f6', flex: 1, marginRight: 8 }]} onPress={() => handleAction('verify')}>
                        <ShieldCheck color="#fff" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>TEKSHIRISH</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444', width: 60 }]} onPress={() => handleAction('reject')}>
                        <XCircle color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            );
        }

        // 3. Approve (District Head / Admin) - If VERIFIED
        if ((role === 'DISTRICT_HEAD' || role === 'ADMIN' || role === 'REGION_HEAD' || role === 'REPUBLIC_HEAD') && currentStatus === 'VERIFIED') {
            return (
                <View style={styles.btnGroup}>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#22c55e', flex: 1, marginRight: 8 }]} onPress={() => handleAction('approve')}>
                        <CheckCircle color="#fff" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.btnText}>TASDIQLASH</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, { backgroundColor: '#ef4444', width: 60 }]} onPress={() => handleAction('reject')}>
                        <XCircle color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color="#1e293b" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hisobot Tafsilotlari</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(currentStatus) }]}>
                        {currentStatus}
                    </Text>
                </View>

                {/* Info Card */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Sana:</Text>
                        <Text style={styles.value}>{report.reportDate}</Text>
                    </View>
                    <View style={styles.divider} />

                    {/* Dynamic Fields based on Type */}
                    {Object.keys(report).map(key => {
                        if (['id', 'reportDate', 'createdAt', 'updatedAt', 'organization', 'status', 'verificationToken', 'approvalToken', 'verifiedBy', 'approvedBy', 'executor', 'verifiedAt', 'approvedAt', 'isTest', 'organizationId'].includes(key)) return null;
                        const label = getFieldLabel(type, key);
                        return (
                            <View key={key} style={styles.row}>
                                <Text style={styles.label}>{label}:</Text>
                                <Text style={styles.value}>{report[key]}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Signatures */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Imzolar</Text>

                    <View style={styles.sigRow}>
                        <User size={20} color={report.executor ? "#10b981" : "#94a3b8"} />
                        <Text style={styles.sigText}>
                            Kiritdi: {report.executor ? (report.executor.firstName + ' ' + report.executor.lastName) : '---'}
                        </Text>
                    </View>

                    <View style={styles.sigRow}>
                        <ShieldCheck size={20} color={report.verifiedBy ? "#3b82f6" : "#94a3b8"} />
                        <Text style={styles.sigText}>
                            Tekshirdi (Mudir): {report.verifiedBy ? (report.verifiedBy.firstName + ' ' + report.verifiedBy.lastName) : '---'}
                        </Text>
                    </View>

                    <View style={styles.sigRow}>
                        <CheckCircle size={20} color={report.approvedBy ? "#22c55e" : "#94a3b8"} />
                        <Text style={styles.sigText}>
                            Tasdiqladi (Rahbar): {report.approvedBy ? (report.approvedBy.firstName + ' ' + report.approvedBy.lastName) : '---'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionArea}>
                    {loading ? <ActivityIndicator size="large" color="#3b82f6" /> : renderActionButtons()}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    content: { padding: 20 },
    statusBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    statusText: { fontWeight: '700', fontSize: 14 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    label: { color: '#64748b', fontSize: 14 },
    value: { color: '#1e293b', fontSize: 14, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 8 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
    sigRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    sigText: { marginLeft: 10, color: '#334155', fontSize: 14 },
    actionArea: { marginTop: 20 },
    btnGroup: { flexDirection: 'row', alignItems: 'center' },
    btn: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default ReportDetailScreen;
