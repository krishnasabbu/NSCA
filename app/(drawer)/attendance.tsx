import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Clock, MapPin, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getTodaysSessions, getAttendance, checkInSession, checkOutSession } from '@/services/api';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // API hooks
  const { data: todaysSessions, loading: sessionsLoading, refetch: refetchSessions } = useApiData(() => getTodaysSessions());
  const { data: attendanceRecords, loading: attendanceLoading } = useApiData(
    () => getAttendance(user?.id || ''),
    [user?.id]
  );
  
  const { mutate: checkInMutation } = useApiMutation();
  const { mutate: checkOutMutation } = useApiMutation();

  // Convert attendance records to calendar format
  const attendanceData = React.useMemo(() => {
    console.log("attendance ========== "+JSON.stringify(attendanceData));
    if (!attendanceRecords) return {};
    
    const markedDates = attendanceRecords.reduce((acc, record) => {
      acc[record.date] = {
        marked: true,
        dotColor: record.status === 'present' ? '#2E7D32' : '#F44336',
        selectedColor: record.date === selectedDate ? '#2E7D32' : undefined,
        selected: record.date === selectedDate,
      };
      return acc;
    }, {} as Record<string, any>);
    
    // Add selected date if not in attendance records
    if (!markedDates[selectedDate]) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: '#2E7D32',
      };
    }
    
    return markedDates;
  }, [attendanceRecords]);
  // Check if user is already checked in today
  const todayAttendance = attendanceRecords?.find(
    record => record.date === new Date().toISOString().split('T')[0] && !record.checkOutTime
  );
  
  React.useEffect(() => {
    setIsCheckedIn(!!todayAttendance);
  }, [todayAttendance]);

  const handleCheckInOut = async () => {
    if (isCheckedIn) {
      Alert.alert(
        'Check Out',
        'Are you sure you want to check out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Check Out',
            onPress: async () => {
              const result = await checkOutMutation((id) => checkOutSession(id), todayAttendance?.id || '');
              if (result) {
                setIsCheckedIn(false);
                refetchSessions();
                Alert.alert('Success', 'You have been checked out successfully!');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Check In',
        'Are you sure you want to check in?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Check In',
            onPress: async () => {
              const firstSession = todaysSessions?.[0];
              if (firstSession) {
                const result = await checkInMutation((userId, sessionId) => checkInSession(userId, sessionId), user?.id || '', firstSession.id);
                if (result) {
                  setIsCheckedIn(true);
                  refetchSessions();
                  Alert.alert('Success', 'You have been checked in successfully!');
                }
              }
            },
          },
        ]
      );
    }
  };

  // Get attendance for selected date
  const selectedDateAttendance = attendanceRecords?.filter(
    record => record.date === selectedDate
  ) || [];
  return (
    <View style={styles.container}>
      <Header title="Attendance" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.checkInSection}>
          <View style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Text style={styles.checkInTitle}>Today's Attendance</Text>
              <Text style={styles.checkInDate}>
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.checkInButton,
                isCheckedIn ? styles.checkOutButton : styles.checkInButtonActive,
              ]}
              onPress={handleCheckInOut}
            >
              {isCheckedIn ? (
                <XCircle size={24} color="#fff" />
              ) : (
                <CheckCircle size={24} color="#fff" />
              )}
              <Text style={styles.checkInButtonText}>
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Text>
            </TouchableOpacity>

            {isCheckedIn && (
              <View style={styles.statusContainer}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusText}>You are currently checked in</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sessions</Text>
          {sessionsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading sessions...</Text>
            </View>
          ) : (
            (todaysSessions || []).map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <View style={styles.sessionMeta}>
                  <View style={styles.sessionMetaItem}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.sessionMetaText}>{session.startTime} - {session.endTime}</Text>
                  </View>
                  <View style={styles.sessionMetaItem}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.sessionMetaText}>{session.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.sessionStatus}>
                <Text style={styles.sessionStatusText}>Upcoming</Text>
              </View>
            </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              markedDates={attendanceData}
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
            />
          </View>
          
          {selectedDateAttendance.length > 0 && (
            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateTitle}>
                Attendance for {new Date(selectedDate).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {selectedDateAttendance.map((record) => (
                <View key={record.id} style={styles.attendanceRecord}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: record.status === 'present' ? '#4CAF50' : '#F44336' }
                  ]} />
                  <Text style={styles.recordText}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                    {record.checkInTime && ` • Check-in: ${record.checkInTime}`}
                    {record.checkOutTime && ` • Check-out: ${record.checkOutTime}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>Absent</Text>
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
  checkInSection: {
    padding: 16,
  },
  checkInCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkInTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  checkInDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  checkInButtonActive: {
    backgroundColor: '#2E7D32',
  },
  checkOutButton: {
    backgroundColor: '#F44336',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#4CAF50',
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
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  sessionMeta: {
    gap: 8,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 6,
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  sessionStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  selectedDateInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  selectedDateTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  attendanceRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recordText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});