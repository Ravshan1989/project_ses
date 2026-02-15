import React, { useEffect, useState } from 'react';
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
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import * as Application from 'expo-application';
import { authApi, sosApi, dailyReportsApi, versionApi } from '../services/api';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { offlineStorage, OfflineReport } from '../services/offlineStorage';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    User,
    Activity,
    FileText,
    ChevronRight,
    LogOut,
    Shield,
    Thermometer,
    Stethoscope,
    AlertTriangle,
    Navigation,
    X,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // SOS State
    const [sosVisible, setSosVisible] = useState(false);
    const [diseases, setDiseases] = useState<any[]>([]);
    const [selectedDisease, setSelectedDisease] = useState<string>('');
    const [sosComment, setSosComment] = useState('');
    const [sosType, setSosType] = useState<'CONFIRMED' | 'SUSPECTED'>('SUSPECTED');
    const [sendingSos, setSendingSos] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    // Sync & Charts State
    const [offlineCount, setOfflineCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [chartData, setChartData] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            checkOfflineQueue();
            fetchChartData();
        }, [])
    );

    useEffect(() => {
        fetchProfile();
        fetchDiseases();
        setupNotifications();
        checkAppVersion();
    }, []);

    const checkAppVersion = async () => {
        try {
            const currentVersion = Application.nativeApplicationVersion || '1.0.0';
            const { data } = await versionApi.getLatest();

            if (data.version !== currentVersion) {
                Alert.alert(
                    'Yangi versiya mavjud!',
                    `Ilovaning yangi ${data.version} versiyasi chiqdi. Yuklab olasizmi?`,
                    [
                        { text: 'Keyinroq', style: 'cancel' },
                        {
                            text: 'Yuklab olish',
                            onPress: () => Linking.openURL(data.downloadUrl)
                        }
                    ]
                );
            }
        } catch (error) {
            console.log('Version check failed', error);
        }
    };

    const setupNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;

        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
    };

    const checkOfflineQueue = async () => {
        const size = await offlineStorage.getQueueSize();
        setOfflineCount(size);
    };

    const fetchChartData = async () => {
        try {
            // UZ: Oxirgi 7 kunlik ma'lumotni olish
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);

            const startDate = start.toISOString().split('T')[0];
            const endDate = end.toISOString().split('T')[0];

            const response = await dailyReportsApi.getWeeklySummary(startDate, endDate);

            // UZ: Grafik uchun ma'lumotni formatlash
            if (response.data && response.data.length > 0) {
                const labels = response.data.slice(0, 5).map((d: any) => d.organization.name.substring(0, 5));
                const values = response.data.slice(0, 5).map((d: any) => d.ari_total);

                setChartData({
                    labels,
                    datasets: [{ data: values }]
                });
            }
        } catch (error) {
            console.error('Chart data error:', error);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const queue = await offlineStorage.getQueue();
            let successCount = 0;

            for (const report of queue) {
                try {
                    if (report.type === 'ari') {
                        await dailyReportsApi.upsertAri(report.data);
                    } else if (report.type === 'covid') {
                        await dailyReportsApi.upsertCovid(report.data);
                    } else {
                        await dailyReportsApi.upsert(report.data);
                    }
                    await offlineStorage.removeReport(report.id);
                    successCount++;
                } catch (e) {
                    console.error('Sync single report error:', e);
                }
            }

            if (successCount > 0) {
                Alert.alert('Muvaffaqiyat', `${successCount} ta hisobot serverga yuborildi!`);
                checkOfflineQueue();
            }
        } catch (error) {
            Alert.alert('Xatolik', 'Sinxronizatsiyada xatolik yuz berdi');
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchDiseases = async () => {
        try {
            const response = await sosApi.getDiseases();
            setDiseases(response.data);
            if (response.data.length > 0) setSelectedDisease(response.data[0].name);
        } catch (error) {
            console.error('Fetch diseases error:', error);
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await authApi.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Profile fetch error:', error);
            Alert.alert('Xatolik', 'Profil ma\'lumotlarini yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleSendSos = async () => {
        if (!selectedDisease) {
            Alert.alert('Xatolik', 'Kasallikni tanlang');
            return;
        }

        setSendingSos(true);
        try {
            // UZ: GPS koordinatalarini olish
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Xatolik', 'Joylashuvni aniqlashga ruxsat berilmagan. SOS GPS\'siz yuboriladi.');
            }

            let currentLoc = null;
            if (status === 'granted') {
                currentLoc = await Location.getCurrentPositionAsync({});
                setLocation(currentLoc);
            }

            await sosApi.createAlert({
                diseaseName: selectedDisease,
                status: sosType,
                comment: sosComment,
                latitude: currentLoc?.coords.latitude,
                longitude: currentLoc?.coords.longitude,
            });

            Alert.alert('Muvaffaqiyat', 'SOS xabari yuborildi! Markazga xabar yetkazildi.');
            setSosVisible(false);
            setSosComment('');
        } catch (error) {
            Alert.alert('Xatolik', 'SOS yuborishda xatolik yuz berdi');
        } finally {
            setSendingSos(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
                <ActivityIndicator size="large" color="#38bdf8" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Background Decoration */}
            <View style={styles.circle1} pointerEvents="none" />
            <View style={styles.circle2} pointerEvents="none" />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <User color="#fff" size={28} />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.welcomeText}>Xush kelibsiz,</Text>
                            <Text style={styles.userName}>{user?.username || 'Foydalanuvchi'}</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutBtn}>
                            <LogOut color="#ef4444" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.orgBadge}>
                        <Shield size={14} color="#38bdf8" style={{ marginRight: 6 }} />
                        <Text style={styles.orgName}>
                            {user?.organization?.name || 'Tashkilot aniqlanmadi'}
                        </Text>
                    </View>

                    {/* SOS Button */}
                    <TouchableOpacity
                        style={styles.sosMainBtn}
                        onPress={() => setSosVisible(true)}
                    >
                        <AlertTriangle color="#fff" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.sosMainText}>FAVQULODDA SOS</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                            <Activity color="#38bdf8" size={24} />
                        </View>
                        <Text style={styles.statValue}>15</Text>
                        <Text style={styles.statLabel}>Bugungi hisobot</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                            <FileText color="#4ade80" size={24} />
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Tasdiqlangan</Text>
                    </View>
                </View>

                {/* Offline Sync Banner */}
                {offlineCount > 0 && (
                    <View style={styles.syncBanner}>
                        <View style={styles.syncInfo}>
                            <Activity color="#fb923c" size={20} />
                            <Text style={styles.syncText}>{offlineCount} ta offline hisobot bor</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.syncBtn}
                            onPress={handleSync}
                            disabled={isSyncing}
                        >
                            {isSyncing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.syncBtnText}>YUBORISH</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Analytics Chart */}
                <Text style={styles.sectionTitle}>Kasallanish dinamikasi (Haftalik)</Text>
                <View style={styles.chartCard}>
                    {chartData ? (
                        <LineChart
                            data={chartData}
                            width={width - 40}
                            height={200}
                            chartConfig={{
                                backgroundColor: '#1e293b',
                                backgroundGradientFrom: '#1e293b',
                                backgroundGradientTo: '#0f172a',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "6", strokeWidth: "2", stroke: "#38bdf8" }
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    ) : (
                        <View style={styles.noDataBox}>
                            <Text style={styles.noDataText}>Ma'lumotlar yuklanmoqda...</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Tezkor amallar</Text>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Hisobotlar', { screen: 'ReportsHistory' })}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                        <FileText color="#3b82f6" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Hisobotlar Tarixi</Text>
                        <Text style={styles.actionDesc}>Yuborilgan va tasdiqlangan hisobotlar</Text>
                    </View>
                    <View style={styles.actionArrow}>
                        <ChevronRight color="#94a3b8" size={20} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Hisobotlar', { screen: 'ReportEntry', params: { type: 'ari', title: "SARI hisoboti" } })}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(251, 146, 60, 0.2)' }]}>
                        <Thermometer color="#fb923c" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>SARI hisoboti</Text>
                        <Text style={styles.actionDesc}>O'tkir respirator infeksiya</Text>
                    </View>
                    <View style={styles.actionArrow}>
                        <ChevronRight color="#94a3b8" size={20} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Hisobotlar', { screen: 'ReportEntry', params: { type: 'ari', title: "O'RVI hisoboti" } })}
                >
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
                        <Stethoscope color="#a78bfa" size={24} />
                    </View>
                    <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>O'RVI hisoboti</Text>
                        <Text style={styles.actionDesc}>Virusli kasalliklar</Text>
                    </View>
                    <View style={styles.actionArrow}>
                        <ChevronRight color="#94a3b8" size={20} />
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* SOS Modal */}
            <Modal
                visible={sosVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSosVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Favqulodda SOS</Text>
                            <TouchableOpacity onPress={() => setSosVisible(false)}>
                                <X color="#94a3b8" size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSub}>Epidemiologik xavf haqida xabar berish</Text>

                        <ScrollView style={styles.modalScroll}>
                            <Text style={styles.inputLabel}>Kasallik turi</Text>
                            <View style={styles.diseaseList}>
                                {diseases.map((d) => (
                                    <TouchableOpacity
                                        key={d.id}
                                        style={[
                                            styles.diseaseBtn,
                                            selectedDisease === d.name && styles.diseaseBtnActive
                                        ]}
                                        onPress={() => setSelectedDisease(d.name)}
                                    >
                                        <Text style={[
                                            styles.diseaseBtnText,
                                            selectedDisease === d.name && styles.diseaseBtnTextActive
                                        ]}>{d.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Holat</Text>
                            <View style={styles.typeRow}>
                                <TouchableOpacity
                                    style={[styles.typeBtn, sosType === 'SUSPECTED' && styles.typeBtnSus]}
                                    onPress={() => setSosType('SUSPECTED')}
                                >
                                    <Text style={[styles.typeBtnText, sosType === 'SUSPECTED' && { color: '#fb923c' }]}>Gumon</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeBtn, sosType === 'CONFIRMED' && styles.typeBtnConf]}
                                    onPress={() => setSosType('CONFIRMED')}
                                >
                                    <Text style={[styles.typeBtnText, sosType === 'CONFIRMED' && { color: '#ef4444' }]}>Tasdiqlangan</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Izoh (ixtiyoriy)</Text>
                            <TextInput
                                style={styles.commentInput}
                                multiline
                                numberOfLines={4}
                                placeholder="Vaziyat haqida qo'shimcha ma'lumot..."
                                placeholderTextColor="#64748b"
                                value={sosComment}
                                onChangeText={setSosComment}
                            />

                            <TouchableOpacity
                                style={[styles.sendSosBtn, sendingSos && { opacity: 0.7 }]}
                                onPress={handleSendSos}
                                disabled={sendingSos}
                            >
                                {sendingSos ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Navigation color="#fff" size={20} style={{ marginRight: 8 }} />
                                        <Text style={styles.sendSosBtnText}>XABARNI YUBORISH</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate-900
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    // Background Circles
    circle1: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#1e3a8a', // Blue-900
        opacity: 0.3,
    },
    circle2: {
        position: 'absolute',
        top: 150,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#1e293b', // Slate-800
        opacity: 0.4,
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    header: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)', // Glass effect
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#38bdf8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    userInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f8fafc',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
    },
    orgBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    orgName: {
        fontSize: 13,
        color: '#bae6fd',
        fontWeight: '500',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        width: '48%',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f8fafc',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 16,
        marginLeft: 4,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 12,
        color: '#64748b',
    },
    actionArrow: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // SOS Styles
    sosMainBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ef4444',
        borderRadius: 16,
        paddingVertical: 12,
        marginTop: 16,
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    sosMainText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#f8fafc',
    },
    modalSub: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 24,
    },
    modalScroll: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38bdf8',
        marginBottom: 12,
        marginTop: 16,
    },
    diseaseList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    diseaseBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.2)',
    },
    diseaseBtnActive: {
        backgroundColor: '#38bdf8',
        borderColor: '#38bdf8',
    },
    diseaseBtnText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '500',
    },
    diseaseBtnTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
    typeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    typeBtnSus: {
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    typeBtnConf: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    typeBtnText: {
        color: '#64748b',
        fontWeight: '600',
    },
    commentInput: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 16,
        padding: 16,
        color: '#f8fafc',
        fontSize: 15,
        textAlignVertical: 'top',
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sendSosBtn: {
        backgroundColor: '#ef4444',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    sendSosBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    // Sync UI & Chart Styles
    syncBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(251, 146, 60, 0.15)',
        padding: 12,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    syncInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    syncText: {
        color: '#fb923c',
        fontWeight: '600',
        marginLeft: 8,
    },
    syncBtn: {
        backgroundColor: '#fb923c',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    syncBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    chartCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 24,
        padding: 10,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    noDataBox: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        color: '#64748b',
        fontSize: 14,
    },
});

export default DashboardScreen;
