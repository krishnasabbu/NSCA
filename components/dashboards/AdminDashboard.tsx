import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Users, DollarSign, Calendar, TrendingUp, UserPlus, Settings } from 'lucide-react-native';
import StatsCard from '@/components/common/StatsCard';
import QuickActionCard from '@/components/common/QuickActionCard';
import { useRouter } from 'expo-router';
import { useApiData } from '@/hooks/useApiData';
import { getAnalyticsOverview, getUsers } from '@/services/api';

export default function AdminDashboard() {
  const router = useRouter();
  
  // API hooks
  const { data: overview, loading: overviewLoading } = useApiData(() => getAnalyticsOverview());
  const { data: users, loading: usersLoading } = useApiData(() => getUsers());

  const stats = [
    { title: 'Active Students', value: overview?.activeStudents?.toString() || '0', icon: Users, color: '#2E7D32' },
    { title: 'Active Coaches', value: (users?.filter(u => u.role === 'coach').length || 0).toString(), icon: UserPlus, color: '#FFD600' },
    { title: 'Monthly Revenue', value: `₹${overview?.totalRevenue?.toLocaleString() || '0'}`, icon: DollarSign, color: '#FF6B35' },
    { title: 'Growth Rate', value: `+${overview?.growthRate || 0}%`, icon: TrendingUp, color: '#1976D2' },
  ];

  const quickActions = [
    { 
      title: 'Manage Users', 
      subtitle: 'Add/edit users', 
      icon: Users, 
      color: '#2E7D32',
      onPress: () => router.push('/(drawer)/users')
    },
    { 
      title: 'Create Batch', 
      subtitle: 'New training batch', 
      icon: Calendar, 
      color: '#1976D2',
      onPress: () => router.push('/(drawer)/batches')
    },
    { 
      title: 'Generate Invoice', 
      subtitle: 'Student billing', 
      icon: DollarSign, 
      color: '#FF6B35',
      onPress: () => router.push('/(drawer)/analytics')
    },
    { 
      title: 'Academy Settings', 
      subtitle: 'Configure app', 
      icon: Settings, 
      color: '#9C27B0',
      onPress: () => router.push('/(drawer)/settings')
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Admin Dashboard 📊</Text>
        <Text style={styles.welcomeSubtext}>Manage your cricket academy efficiently</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academy Overview</Text>
        {overviewLoading || usersLoading ? (
          <Text style={styles.loadingText}>Loading stats...</Text>
        ) : (
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management Tools</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Registrations</Text>
        <View style={styles.registrationsContainer}>
            {usersLoading ? (
              <Text style={styles.loadingText}>Loading recent registrations...</Text>
            ) : (
              (users?.filter(u => u.role === 'student').slice(0, 3) || []).map((student) => (
                <View key={student.id} style={styles.registrationItem}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.registrationContent}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.registrationDate}>Joined {student.joinDate}</Text>
                  </View>
                  <View style={styles.batchTag}>
                    <Text style={styles.batchText}>{student.batch || 'General'}</Text>
                  </View>
                </View>
              ))
            )}
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
  registrationsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  registrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  registrationContent: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  registrationDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  batchTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF9C4',
    borderRadius: 6,
  },
  batchText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#F57F17',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});