import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Chrome as Home, ChartBar as BarChart3, UserCheck, Calendar, Users, BookOpen, Target, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const getTabsForRole = () => {
    const baseTabs = [
      { name: 'Home', route: '/(drawer)', icon: Home },
      { name: 'Schedule', route: '/(drawer)/schedule', icon: Calendar },
      { name: 'Attendance', route: '/(drawer)/attendance', icon: UserCheck },
      { name: 'Profile', route: '/(drawer)/profile', icon: Target },
    ];

    if (user?.role === 'student') {
      return [
        ...baseTabs.slice(0, 2),
        { name: 'Learning', route: '/(drawer)/learning', icon: BookOpen },
        ...baseTabs.slice(2),
      ];
    }

    if (user?.role === 'coach') {
      return [
        ...baseTabs.slice(0, 2),
        { name: 'Students', route: '/(drawer)/students', icon: Users },
        ...baseTabs.slice(2),
      ];
    }

    if (user?.role === 'admin') {
      return [
        baseTabs[0],
        { name: 'Analytics', route: '/(drawer)/analytics', icon: BarChart3 },
        { name: 'Users', route: '/(drawer)/users', icon: Users },
        { name: 'Settings', route: '/(drawer)/settings', icon: Settings },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabsForRole();

  const isActiveTab = (route: string) => {
    if (route === '/(drawer)' && pathname === '/(drawer)') return true;
    if (route !== '/(drawer)' && pathname.includes(route.split('/').pop() || '')) return true;
    return false;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = isActiveTab(tab.route);
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <IconComponent 
                  size={20} 
                  color={isActive ? '#2E7D32' : '#666'} 
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      default: {
        elevation: 8,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#f0f8f0',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#2E7D32',
    fontFamily: 'Inter-SemiBold',
  },
});