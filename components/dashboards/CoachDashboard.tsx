import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Users, Calendar, BookOpen, Star, Clock, Activity } from 'lucide-react-native';
import StatsCard from '@/components/common/StatsCard';
import QuickActionCard from '@/components/common/QuickActionCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useApiData } from '@/hooks/useApiData';
import { getCoachStats, getSessions } from '@/services/api';

export default function CoachDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  // API hooks
  const { data: stats, loading: statsLoading } = useApiData(
    () => getCoachStats(user?.id || ''),
    [user?.id]
  );
  
  const { data: todaySessions, loading: sessionsLoading } = useApiData(
    () => getSessions(new Date().toISOString().split('T')[0])
  );

  const statsCards = [
    { title: 'Active Students', value: stats?.activeStudents?.toString() || '0', icon: Users, color: '#2E7D32' },
    { title: 'Sessions Today', value: stats?.sessionsToday?.toString() || '0', icon: Calendar, color: '#FFD600' },
    { title: 'Content Uploaded', value: stats?.contentUploaded?.toString() || '0', icon: BookOpen, color: '#1976D2' },
    { title: 'Student Rating', value: '4.8', icon: Star, color: '#FF6B35' },
  ];

  const quickActions = [
    { 
      title: 'Schedule Session', 
      subtitle: 'Book new slots', 
      icon: Calendar, 
      color: '#2E7D32',
      onPress: () => router.push('/(drawer)/schedule')
    },
    { 
      title: 'Upload Content', 
      subtitle: 'Add tutorials', 
      icon: BookOpen, 
      color: '#1976D2',
      onPress: () => router.push('/(drawer)/content')
    },
    { 
      title: 'Student Progress', 
      subtitle: 'Review performance', 
      icon: Users, 
      color: '#FF6B35',
      onPress: () => router.push('/(drawer)/students')
    },
    { 
      title: 'Fitness Tests', 
      subtitle: 'Record results', 
      icon: Activity, 
      color: '#9C27B0',
      onPress: () => router.push('/(drawer)/yoyo-test')
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Good morning, Coach Virat! 🏏</Text>
        <Text style={styles.welcomeSubtext}>You have 3 sessions scheduled today</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        {statsLoading ? (
          <Text style={styles.loadingText}>Loading stats...</Text>
        ) : (
        <View style={styles.statsGrid}>
          {statsCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {sessionsLoading ? (
          <Text style={styles.loadingText}>Loading sessions...</Text>
        ) : (
          <View style={styles.scheduleContainer}>
            {(todaySessions || []).map((session, index) => (
              <View key={session.id} style={styles.scheduleItem}>
                <View style={styles.timeContainer}>
                  <Clock size={16} color="#2E7D32" />
                  <Text style={styles.timeText}>{session.startTime}</Text>
                </View>
                <View style={styles.sessionContent}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionStudents}>{session.students} students</Text>
                </View>
                <View style={styles.sessionStatus}>
                  <Text style={styles.statusText}>{session.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeSection: {
    backgroundColor: '#2E7D32',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#E8F5E8',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scheduleContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 6,
  },
  sessionContent: {
    flex: 1,
    marginLeft: 16,
  },
  sessionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  sessionStudents: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});