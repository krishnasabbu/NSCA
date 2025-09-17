import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Chrome as Home, BookOpen, Calendar, Users, ChartBar as BarChart3, Settings, LogOut, GraduationCap, UserCheck, Bell, Target, FolderOpen } from 'lucide-react-native';
import { Activity } from 'lucide-react-native';
import BottomTabBar from '@/components/common/BottomTabBar';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ]
    );
  };

  const getMenuItems = () => {
    const baseItems = [
      { name: 'Dashboard', route: '/(drawer)', icon: Home },
      { name: 'Learning Hub', route: '/(drawer)/learning', icon: BookOpen },
      { name: 'Attendance', route: '/(drawer)/attendance', icon: UserCheck },
      { name: 'Schedule', route: '/(drawer)/schedule', icon: Calendar },
      { name: 'Profile', route: '/(drawer)/profile', icon: Target },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        { name: 'Notifications', route: '/(drawer)/notifications', icon: Bell },
      ];
    }

    if (user?.role === 'coach') {
      return [
        ...baseItems,
        { name: 'Students', route: '/(drawer)/students', icon: Users },
        { name: 'Content', route: '/(drawer)/content', icon: FolderOpen },
        { name: 'Yoyo Test', route: '/(drawer)/yoyo-test', icon: Activity },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Users', route: '/(drawer)/users', icon: Users },
        { name: 'Batches', route: '/(drawer)/batches', icon: GraduationCap },
        { name: 'Yoyo Test', route: '/(drawer)/yoyo-test', icon: Activity },
        { name: 'Analytics', route: '/(drawer)/analytics', icon: BarChart3 },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏏</Text>
        </View>
        <Text style={styles.academyName}>Nature Space{'\n'}Cricket Academy</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        )}
      </View>

      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <DrawerItem
              key={item.name}
              label={item.name}
              onPress={() => {
                try {
                  router.push(item.route as any);
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              icon={({ color, size }) => (
                <IconComponent color={color} size={size} />
              )}
              labelStyle={styles.drawerItemLabel}
              style={styles.drawerItem}
              activeTintColor="#2E7D32"
              inactiveTintColor="#666"
            />
          );
        })}
        
        <View style={styles.divider} />
        
        <DrawerItem
          label="Settings"
          onPress={() => {
            try {
              router.push('/(drawer)/settings');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}
          icon={({ color, size }) => (
            <Settings color={color} size={size} />
          )}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
          activeTintColor="#2E7D32"
          inactiveTintColor="#666"
        />
        
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
          icon={({ color, size }) => (
            <LogOut color={color} size={size} />
          )}
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
          activeTintColor="#dc2626"
          inactiveTintColor="#666"
        />
      </DrawerContentScrollView>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <View style={styles.container}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#fff',
            width: Platform.OS === 'web' ? 280 : 280,
          },
          drawerType: Platform.OS === 'web' ? 'permanent' : 'front',
        }}
      >
        <Drawer.Screen 
          name="index" 
          options={{
            drawerLabel: 'Dashboard',
          }}
        />
        <Drawer.Screen 
          name="learning" 
          options={{
            drawerLabel: 'Learning Hub',
          }}
        />
        <Drawer.Screen 
          name="attendance" 
          options={{
            drawerLabel: 'Attendance',
          }}
        />
        <Drawer.Screen 
          name="schedule" 
          options={{
            drawerLabel: 'Schedule',
          }}
        />
        <Drawer.Screen 
          name="notifications" 
          options={{
            drawerLabel: 'Notifications',
          }}
        />
        <Drawer.Screen 
          name="profile" 
          options={{
            drawerLabel: 'Profile',
          }}
        />
        <Drawer.Screen 
          name="students" 
          options={{
            drawerLabel: 'Students',
          }}
        />
        <Drawer.Screen 
          name="content" 
          options={{
            drawerLabel: 'Content',
          }}
        />
        <Drawer.Screen 
          name="users" 
          options={{
            drawerLabel: 'Users',
          }}
        />
        <Drawer.Screen 
          name="batches" 
          options={{
            drawerLabel: 'Batches',
          }}
        />
        <Drawer.Screen 
          name="analytics" 
          options={{
            drawerLabel: 'Analytics',
          }}
        />
        <Drawer.Screen 
          name="yoyo-test" 
          options={{
            drawerLabel: 'Yoyo Test',
          }}
        />
        <Drawer.Screen 
          name="settings" 
          options={{
            drawerLabel: 'Settings',
          }}
        />
      </Drawer>
      {Platform.OS !== 'web' && <BottomTabBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerHeader: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoEmoji: {
    fontSize: 30,
  },
  academyName: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  userRole: {
    color: '#FFD600',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  drawerItem: {
    marginHorizontal: 10,
    borderRadius: 8,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 10,
    marginHorizontal: 20,
  },
});