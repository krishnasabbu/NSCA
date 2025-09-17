import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import NotificationDropdown from './NotificationDropdown';
import { useDrawer } from 'expo-router/drawer';

interface HeaderProps {
  title: string;
  showProfile?: boolean;
}

export default function Header({ title, showProfile = true }: HeaderProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [showNotifications, setShowNotifications] = useState(false);
  const drawer = useDrawer();
  const handleMenuPress = () => {
    try {
      drawer.openDrawer();
    } catch (error) {
      console.error('Error opening drawer:', error);
    }
  };

  const handleNotificationPress = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
          <Menu size={24} color="#2E7D32" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={handleNotificationPress}
          >
            <Bell size={22} color="#666" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          
          {showProfile && (
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <User size={18} color="#2E7D32" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {showNotifications && (
        <NotificationDropdown 
          onClose={() => setShowNotifications(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      default: {
        elevation: 2,
      },
    }),
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    height: 56,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2E7D32',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});