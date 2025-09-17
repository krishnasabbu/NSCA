import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TrendingUp, Target, BookOpen, Calendar, Star, Award, Activity } from 'lucide-react-native';
import StatsCard from '@/components/common/StatsCard';
import QuickActionCard from '@/components/common/QuickActionCard';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useApiData } from '@/hooks/useApiData';
import { getStudentStats, getYoyoTests } from '@/services/api';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  
  // API hooks
  const { data: stats, loading } = useApiData(
    () => getStudentStats(user?.id || ''),
    [user?.id]
  );
  
  const { data: yoyoTests } = useApiData(
    () => getYoyoTests(user?.id || ''),
    [user?.id]
  );

  const latestYoyoScore = yoyoTests && yoyoTests.length > 0 
    ? yoyoTests[yoyoTests.length - 1].score.toString()
    : 'N/A';

  const statsCards = [
    { title: 'Batting Average', value: stats?.battingAverage?.toString() || '0', icon: TrendingUp, color: '#2E7D32' },
    { title: 'Sessions This Month', value: stats?.sessionsThisMonth?.toString() || '0', icon: Calendar, color: '#FFD600' },
    { title: 'Yoyo Test Score', value: latestYoyoScore, icon: Activity, color: '#FF6B35' },
    { title: 'Overall Rating', value: stats?.overallRating?.toString() || '0', icon: Star, color: '#9C27B0' },
  ];

  const quickActions = [
    { 
      title: 'Mark Attendance', 
      subtitle: 'Check in/out', 
      icon: Calendar, 
      color: '#2E7D32',
      onPress: () => router.push('/(drawer)/attendance')
    },
    { 
      title: 'Learning Hub', 
      subtitle: 'Watch tutorials', 
      icon: BookOpen, 
      color: '#1976D2',
      onPress: () => router.push('/(drawer)/learning')
    },
    { 
      title: 'View Progress', 
      subtitle: 'Track performance', 
      icon: TrendingUp, 
      color: '#FF6B35',
      onPress: () => router.push('/(drawer)/profile')
    },
    { 
      title: 'Fitness Test', 
      subtitle: 'View results', 
      icon: Activity, 
      color: '#9C27B0',
      onPress: () => router.push('/(drawer)/yoyo-test')
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back, Rahul! 🏏</Text>
        <Text style={styles.welcomeSubtext}>Ready for today's practice?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Performance</Text>
        {loading ? (
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
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Target size={16} color="#2E7D32" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Completed Batting Drill</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Award size={16} color="#FFD600" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Received Coach Feedback</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Calendar size={16} color="#1976D2" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Attended Practice Session</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
        </View>
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
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});