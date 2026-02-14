import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { authApi } from '../services/api';
import { saveToken } from '../services/auth';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Diqqat', 'Login va parolni kiriting');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.login({ username, password });
            const { access_token } = response.data;
            if (!access_token) throw new Error('Token olinmadi');
            await saveToken(access_token);
            onLoginSuccess();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Tizimga kirishda xatolik';
            Alert.alert('Xatolik', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Decorative Background Elements */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>

                            <View style={styles.header}>
                                <View style={styles.iconContainer}>
                                    <ShieldCheck size={40} color="#fff" />
                                </View>
                                <Text style={styles.title}>SMART SES</Text>
                                <Text style={styles.subtitle}>Milliy Sanitariya Tizimi</Text>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.welcome}>Tizimga kirish</Text>

                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIconWrapper}>
                                        <User size={20} color="#bae6fd" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Login"
                                        placeholderTextColor="#94a3b8"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <View style={styles.inputIconWrapper}>
                                        <Lock size={20} color="#bae6fd" />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Parol"
                                        placeholderTextColor="#94a3b8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.forgotPass}
                                    onPress={() => Alert.alert('Ma\'lumot', 'Adminstrator bilan bog\'laning')}
                                >
                                    <Text style={styles.forgotPassText}>Parolni unutdingizmi?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.loginBtn}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#0f172a" />
                                    ) : (
                                        <>
                                            <Text style={styles.loginBtnText}>KIRISH</Text>
                                            <ArrowRight size={20} color="#0f172a" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Respublika SES Markazi</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // Slate-900 (Main Dark Background)
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    // Decorative Background Circles
    circle1: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#1e3a8a', // Blue-900
        opacity: 0.5,
    },
    circle2: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#1e293b', // Slate-800
        opacity: 0.8,
    },
    content: {
        paddingHorizontal: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 70,
        height: 70,
        backgroundColor: 'rgba(56, 189, 248, 0.2)', // Sky-400 with opacity
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.5)',
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#f8fafc', // Slate-50
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8', // Slate-400
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    formCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)', // Slate-800 low opacity (Glass-like)
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    welcome: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#020617', // Slate-950
        borderRadius: 14,
        marginBottom: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#334155', // Slate-700
    },
    inputIconWrapper: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
        paddingRight: 16,
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPassText: {
        color: '#38bdf8', // Sky-400
        fontSize: 13,
    },
    loginBtn: {
        backgroundColor: '#38bdf8', // Sky-400 (Accent)
        height: 56,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38bdf8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    loginBtnText: {
        color: '#0f172a', // Slate-900
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
    },
});

export default LoginScreen;
