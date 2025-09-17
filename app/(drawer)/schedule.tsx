import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Clock, Users, MapPin, Plus, CreditCard as Edit } from 'lucide-react-native';
import Header from '@/components/common/Header';
import ScheduleSessionModal from '@/components/forms/ScheduleSessionModal';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getSessions, createSession, Session } from '@/services/api';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // API hooks
  const { data: allSessions, loading, error, refetch } = useApiData(() => getSessions());
  const { mutate: createSessionMutation } = useApiMutation();

  // Group sessions by date
  const sessionsByDate = (allSessions || []).reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push({
      ...session,
      time: `${session.startTime} - ${session.endTime}`,
    });
    return acc;
  }, {} as Record<string, any[]>);

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#2E7D32',
    },
    '2024-01-16': { marked: true, dotColor: '#2E7D32' },
    '2024-01-17': { marked: true, dotColor: '#FFD600' },
    '2024-01-18': { marked: true, dotColor: '#2E7D32' },
    '2024-01-19': { marked: true, dotColor: '#1976D2' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#2E7D32';
      case 'ongoing': return '#FF9800';
      case 'completed': return '#666';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleAddSession = () => {
    setShowAddModal(true);
  };

  const handleAddSessionSubmit = async (sessionData: any) => {
    const result = await createSessionMutation(sessionData => createSession(sessionData), sessionData);
    if (result) {
      refetch();
      Alert.alert('Success', 'Session scheduled successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Schedule" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        <View style={styles.calendarSection}>
          <Calendar
            current={selectedDate}
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#2E7D32',
              selectedDayBackgroundColor: '#2E7D32',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FFD600',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#2E7D32',
              selectedDotColor: '#ffffff',
              arrowColor: '#2E7D32',
              monthTextColor: '#2E7D32',
              indicatorColor: '#2E7D32',
              textDayFontFamily: 'Inter-Regular',
              textMonthFontFamily: 'Inter-SemiBold',
              textDayHeaderFontFamily: 'Inter-Medium',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.sessionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Sessions for {new Date(selectedDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {sessionsByDate[selectedDate]?.length > 0 ? (
            sessionsByDate[selectedDate].map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <TouchableOpacity style={styles.editButton}>
                    <Edit size={16} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sessionDetails}>
                  <View style={styles.sessionDetailItem}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.sessionDetailText}>{session.time}</Text>
                  </View>
                  
                  <View style={styles.sessionDetailItem}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.sessionDetailText}>{session.location}</Text>
                  </View>
                  
                  <View style={styles.sessionDetailItem}>
                    <Users size={16} color="#666" />
                    <Text style={styles.sessionDetailText}>
                      {session.students}/{session.maxStudents} students
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionFooter}>
                  <View style={styles.attendanceBar}>
                    <View style={styles.attendanceBarBg}>
                      <View 
                        style={[
                          styles.attendanceBarFill,
                          { width: `${(session.students / session.maxStudents) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.attendanceText}>
                      {Math.round((session.students / session.maxStudents) * 100)}% full
                    </Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                      {getStatusText(session.status)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No sessions scheduled for this date</Text>
              <TouchableOpacity style={styles.addSessionButton} onPress={handleAddSession}>
                <Plus size={20} color="#2E7D32" />
                <Text style={styles.addSessionText}>Add Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability Status</Text>
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityItem}>
              <View style={[styles.availabilityDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.availabilityText}>Available</Text>
            </View>
            <TouchableOpacity style={styles.toggleAvailabilityButton}>
              <Text style={styles.toggleAvailabilityText}>Mark as Unavailable</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <ScheduleSessionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSessionSubmit}
      />
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
  calendarSection: {
    margin: 16,
  },
  calendar: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sessionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  sessionDetails: {
    gap: 8,
    marginBottom: 16,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceBar: {
    flex: 1,
    marginRight: 16,
  },
  attendanceBarBg: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  attendanceBarFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  addSessionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  availabilityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  toggleAvailabilityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  toggleAvailabilityText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
  },
});