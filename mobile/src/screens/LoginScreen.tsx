import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { authApi } from '../services/api';
import { saveToken } from '../services/auth';

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Xato', 'Iltimos, barcha maydonlarni to\'ldiring');
            return;
        }

        setLoading(true);
        try {
            console.log('[DEBUG] LoginScreen: Attempting login for:', username);
            const response = await authApi.login({ username, password });
            console.log('[DEBUG] LoginScreen: Response received:', response.status);

            const { access_token } = response.data;
            if (!access_token) {
                console.error('[DEBUG] LoginScreen: access_token missing in response');
                throw new Error('Token topilmadi');
            }

            console.log('[DEBUG] LoginScreen: Saving token...');
            await saveToken(access_token);
            console.log('[DEBUG] LoginScreen: Token saved, calling onLoginSuccess');
            onLoginSuccess();
        } catch (error: any) {
            console.error('[DEBUG] LoginScreen: Error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Tizimga kirishda xatolik yuz berdi';
            Alert.alert('Kirishda xatolik', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>SMART SES</Text>
                    <Text style={styles.subtitle}>Tizimga kirish (Mobil)</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Foydalanuvchi nomi</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Loginingizni kiriting"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Parol</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Parolingizni kiriting"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>KIRISH</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Sanitariya-epidemiologik osoyishtalik xizmati</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    inner: {
        padding: 24,
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1677ff',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 8,
    },
    form: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#f8fafc',
    },
    loginButton: {
        height: 50,
        backgroundColor: '#1677ff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        marginTop: 48,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

export default LoginScreen;
