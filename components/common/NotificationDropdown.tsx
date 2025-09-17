import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, Calendar, Award, Bell } from 'lucide-react-native';

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter();

  const notifications = [
    {
      id: '1',
      title: 'New Feedback from Coach',
      message: 'Great improvement in your batting stance!',
      type: 'feedback',
      time: '2h ago',
      icon: MessageSquare,
      color: '#1976D2',
    },
    {
      id: '2',
      title: 'Session Reminder',
      message: 'Batting practice starts in 30 minutes',
      type: 'session',
      time: '4h ago',
      icon: Calendar,
      color: '#2E7D32',
    },
    {
      id: '3',
      title: 'Achievement Unlocked!',
      message: 'Completed 10 bowling drills this week',
      type: 'achievement',
      time: '1d ago',
      icon: Award,
      color: '#FFD600',
    },
  ];

  const handleViewAll = () => {
    router.push('/notifications');
    onClose();
  };

  return (
    <>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.dropdown}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationItem}>
              <View style={[styles.iconContainer, { backgroundColor: `${notification.color}15` }]}>
                <notification.icon size={16} color={notification.color} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAll}>
          <Bell size={16} color="#2E7D32" />
          <Text style={styles.viewAllButtonText}>View All Notifications</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 320,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  notificationsList: {
    maxHeight: 240,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  viewAllButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginLeft: 8,
  },
});