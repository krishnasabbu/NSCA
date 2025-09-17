import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Bell, MessageSquare, Calendar, Award, Settings, Trash2 } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getNotifications, markNotificationAsRead, Notification } from '@/services/api';


export default function NotificationsScreen() {
  const { user } = useAuth();
  const { data: notifications, loading, error, refetch } = useApiData(
    () => getNotifications(user?.id || ''),
    [user?.id]
  );
  const { mutate: markAsRead } = useApiMutation<boolean>();

  const [notificationSettings, setNotificationSettings] = useState({
    sessions: true,
    feedback: true,
    achievements: true,
    announcements: true,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'feedback': return MessageSquare;
      case 'session': return Calendar;
      case 'achievement': return Award;
      case 'announcement': return Bell;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'feedback': return '#1976D2';
      case 'session': return '#2E7D32';
      case 'achievement': return '#FFD600';
      case 'announcement': return '#FF6B35';
      default: return '#666';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(markNotificationAsRead, id);
    if (result) {
      refetch();
    }
  };

  const deleteNotification = async (id: string) => {
    // For now, just mark as read since we don't have delete API
    await handleMarkAsRead(id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Alerts</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          
          {(notifications || []).map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadCard,
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                    <IconComponent size={20} color={iconColor} />
                  </View>
                  
                  <View style={styles.textContent}>
                    <Text style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.unreadTitle,
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Trash2 size={16} color="#999" />
                  </TouchableOpacity>
                </View>
                
                {!notification.isRead && <View style={styles.unreadIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Session Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified about upcoming practice sessions
                </Text>
              </View>
              <Switch
                value={notificationSettings.sessions}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, sessions: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Coach Feedback</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications when coaches provide feedback
                </Text>
              </View>
              <Switch
                value={notificationSettings.feedback}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, feedback: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Achievements</Text>
                <Text style={styles.settingDescription}>
                  Get notified about milestones and achievements
                </Text>
              </View>
              <Switch
                value={notificationSettings.achievements}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, achievements: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Academy Announcements</Text>
                <Text style={styles.settingDescription}>
                  Stay updated with academy news and events
                </Text>
              </View>
              <Switch
                value={notificationSettings.announcements}
                onValueChange={(value) =>
                  setNotificationSettings(prev => ({ ...prev, announcements: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#2E7D32',
  },
  notificationMessage: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});