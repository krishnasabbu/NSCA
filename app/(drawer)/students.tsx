import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Search, Filter, Star, MessageSquare, Target, UserCheck, UserX, Calendar } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getCoachStudents, markAttendance, getTodaysSessions } from '@/services/api';

export default function StudentsScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // API hooks
  const { data: students, loading, error, refetch } = useApiData(
    () => getCoachStudents(user?.id || ''),
    [user?.id]
  );
  const { data: todaySessions } = useApiData(() => getTodaysSessions());
  const { mutate: markAttendanceMutation } = useApiMutation();

  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || student.skillLevel === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkAttendance = async (studentId: string, studentName: string, status: 'present' | 'absent') => {
    const currentSession = todaySessions?.[0];
    if (!currentSession) {
      Alert.alert('No Session', 'No active session found for today');
      return;
    }

    const result = await markAttendanceMutation(markAttendance, {
      studentId,
      sessionId: currentSession.id,
      status,
      markedBy: user?.id || ''
    });
    
    if (result) {
      Alert.alert('Success', `${studentName} marked as ${status}`);
      refetch();
    }
  };

  const handleOpenAttendanceModal = (student: any) => {
    setSelectedStudent(student);
    setShowAttendanceModal(true);
  };

  const handleMarkAttendanceFromModal = async (status: 'present' | 'absent') => {
    if (!selectedStudent) return;
    
    await handleMarkAttendance(selectedStudent.id, selectedStudent.name, status);
    setShowAttendanceModal(false);
    setSelectedStudent(null);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Students" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>
            Students ({filteredStudents.length})
          </Text>
          
          {filteredStudents.map((student) => (
            <TouchableOpacity key={student.id} style={styles.studentCard}>
              <Image source={{ uri: student.avatar }} style={styles.studentAvatar} />
              
              <View style={styles.studentContent}>
                <View style={styles.studentHeader}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FFD600" fill="#FFD600" />
                    <Text style={styles.ratingText}>{student.rating}</Text>
                  </View>
                </View>
                
                <View style={styles.studentMeta}>
                  <Text style={styles.studentAge}>Age: {student.age}</Text>
                  <Text style={styles.studentBatch}>{student.batch || 'General'}</Text>
                </View>
                
                <View style={styles.skillLevelContainer}>
                  <View style={[
                    styles.skillLevelTag,
                    { backgroundColor: getSkillLevelColor(student.skillLevel || 'Beginner') + '20' }
                  ]}>
                    <Text style={[
                      styles.skillLevelText,
                      { color: getSkillLevelColor(student.skillLevel || 'Beginner') }
                    ]}>
                      {student.skillLevel || 'Beginner'}
                    </Text>
                  </View>
                  <Text style={styles.lastSession}>Last session: 2 hours ago</Text>
                </View>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '75%' }]} />
                  </View>
                  <Text style={styles.progressText}>75%</Text>
                </View>
              </View>

              <View style={styles.studentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageSquare size={18} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleOpenAttendanceModal(student)}
                >
                  <Calendar size={18} color="#1976D2" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedStudent && (
        <View style={styles.modalOverlay}>
          <View style={styles.attendanceModal}>
            <Text style={styles.modalTitle}>Mark Attendance</Text>
            <Text style={styles.modalSubtitle}>
              Student: {selectedStudent.name}
            </Text>
            <Text style={styles.modalDate}>
              Date: {new Date().toLocaleDateString('en-IN')}
            </Text>
            
            <View style={styles.attendanceButtons}>
              <TouchableOpacity 
                style={[styles.attendanceButton, styles.presentButton]}
                onPress={() => handleMarkAttendanceFromModal('present')}
              >
                <UserCheck size={24} color="#fff" />
                <Text style={styles.attendanceButtonText}>Present</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.attendanceButton, styles.absentButton]}
                onPress={() => handleMarkAttendanceFromModal('absent')}
              >
                <UserX size={24} color="#fff" />
                <Text style={styles.attendanceButtonText}>Absent</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAttendanceModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  searchSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  studentsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  studentContent: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 4,
  },
  studentMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  studentAge: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 16,
  },
  studentBatch: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillLevelTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillLevelText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  lastSession: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#666',
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    width: 30,
    textAlign: 'right',
  },
  studentActions: {
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  attendanceModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginBottom: 24,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  presentButton: {
    backgroundColor: '#4CAF50',
  },
  absentButton: {
    backgroundColor: '#F44336',
  },
  attendanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
});