import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, FileText, User, BarChart2 } from 'lucide-react-native';
import { View, ActivityIndicator } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ExecutiveDashboardScreen from '../screens/ExecutiveDashboardScreen';
import ReportListScreen from '../screens/ReportListScreen';
import ReportEntryScreen from '../screens/ReportEntryScreen';
import ReportsHistoryScreen from '../screens/ReportsHistoryScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authApi } from '../services/api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ReportsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ReportList" component={ReportListScreen} />
        <Stack.Screen name="ReportEntry" component={ReportEntryScreen} />
        <Stack.Screen name="ReportsHistory" component={ReportsHistoryScreen} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
    </Stack.Navigator>
);

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabNavigator = ({ onLogout }: { onLogout: () => void }) => {
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authApi.getProfile();
                setUser(response.data);
            } catch (error) {
                console.error('Navigation profile fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#1677ff" />
            </View>
        );
    }

    const isRegionHead = user?.role === 'REGION_HEAD';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Asosiy') {
                        return isRegionHead ? <BarChart2 size={size} color={color} /> : <LayoutDashboard size={size} color={color} />;
                    } else if (route.name === 'Hisobotlar') {
                        return <FileText size={size} color={color} />;
                    } else if (route.name === 'Profil') {
                        return <User size={size} color={color} />;
                    }
                    return null;
                },
                tabBarActiveTintColor: '#1677ff',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    backgroundColor: '#fff',
                },
                headerStyle: {
                    backgroundColor: '#fff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                },
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                    color: '#1e293b',
                }
            })}
        >
            <Tab.Screen
                name="Asosiy"
                component={isRegionHead ? ExecutiveDashboardScreen : DashboardScreen}
                options={{ title: isRegionHead ? 'Rahbar Paneli' : 'Asosiy' }}
            />

            {!isRegionHead && (
                <Tab.Screen name="Hisobotlar" component={ReportsStack} options={{ title: 'Hisobotlar' }} />
            )}

            <Tab.Screen name="Profil" options={{ title: 'Profil' }}>
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default TabNavigator;
