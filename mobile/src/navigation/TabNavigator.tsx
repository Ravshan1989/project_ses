import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, FileText, User } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import ReportListScreen from '../screens/ReportListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Asosiy') {
                        return <LayoutDashboard size={size} color={color} />;
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
                    height: 60,
                    paddingBottom: 8,
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
            <Tab.Screen name="Asosiy" component={DashboardScreen} options={{ title: 'Bosh sahifa' }} />
            <Tab.Screen name="Hisobotlar" component={ReportListScreen} options={{ title: 'Hisobotlar' }} />
            <Tab.Screen name="Profil" options={{ title: 'Profil' }}>
                {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default TabNavigator;
