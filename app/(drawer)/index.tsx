import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import CoachDashboard from '@/components/dashboards/CoachDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import Header from '@/components/common/Header';

export default function DashboardScreen() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'coach':
        return <CoachDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid user role</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderDashboard()}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
});