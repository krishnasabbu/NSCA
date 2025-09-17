import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, Activity, Calendar, User, Target, Save, Trash2 } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useAuth } from '@/hooks/useAuth';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getYoyoTests, createYoyoTest, getCoachStudents, YoyoTestResult } from '@/services/api';
import Modal from 'react-native-modal';

export default function YoyoTestScreen() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [testData, setTestData] = useState({
    yoYoScore: '',
    sprint20m: '',
    verticalJump: '',
    pushUps: '',
    battingAccuracy: '',
    bowlingSpeed: '',
    fieldingAccuracy: '',
    plankHold: '',
    progressNotes: ''
  });

  // API hooks
  const { data: yoyoTests, loading: testsLoading, refetch } = useApiData(() => getYoyoTests());
  const { data: students, loading: studentsLoading } = useApiData(
    () => user?.role === 'coach' ? getCoachStudents(user.id) : getYoyoTests(user?.id || ''),
    [user?.id, user?.role]
  );
  const { mutate: createTestMutation } = useApiMutation<YoyoTestResult>();
  

  const handleAddTest = async () => {
    if (!selectedStudent || !testData.yoYoScore) {
      Alert.alert('Error', 'Please select a student and enter Yo-Yo score');
      return;
    }

    const newTest = {
      studentId: selectedStudent,
      testDate: new Date().toISOString().split('T')[0],
      yoYoScore: parseFloat(testData.yoYoScore),
      sprint20m: testData.sprint20m || '',
      verticalJump: testData.verticalJump || '',
      pushUps: testData.pushUps ? parseInt(testData.pushUps) : 0,
      battingAccuracy: testData.battingAccuracy || '',
      bowlingSpeed: testData.bowlingSpeed ? parseInt(testData.bowlingSpeed) : 0,
      fieldingAccuracy: testData.fieldingAccuracy || '',
      plankHold: testData.plankHold || '',
      progressNotes: testData.progressNotes || '',
      conductedBy: user?.id || '',
    };

    
    const result = await createTestMutation((data) => createYoyoTest(data), newTest);
    if (result) {
      refetch();
      setShowAddModal(false);
      setTestData({
        yoYoScore: '',
        sprint20m: '',
        verticalJump: '',
        pushUps: '',
        battingAccuracy: '',
        bowlingSpeed: '',
        fieldingAccuracy: '',
        plankHold: '',
        progressNotes: ''
      });
      setSelectedStudent('');
      Alert.alert('Success', 'Fitness test result recorded successfully!');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return '#4CAF50';
    if (score >= 12) return '#FF9800';
    return '#F44336';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // For students, show their own test results
  const displayTests = user?.role === 'student' 
    ? (yoyoTests || []).filter(test => test.studentId === user.id)
    : (yoyoTests || []);

  return (
    <View style={styles.container}>
      <Header title="Yoyo Fitness Test" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {user?.role === 'student' && (
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Activity size={24} color="#2E7D32" />
              <Text style={styles.infoTitle}>Monthly Fitness Assessment</Text>
              <Text style={styles.infoDescription}>
                Track your cardiovascular fitness progress with the Yoyo Intermittent Recovery Test
              </Text>
            </View>
          </View>
        )}

        {(user?.role === 'coach' || user?.role === 'admin') && (
          <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>Fitness Test Management</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Record Test</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {user?.role === 'student' ? 'Your Test Results' : 'Recent Test Results'}
          </Text>
          
          {testsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading test results...</Text>
            </View>
          ) : displayTests.length > 0 ? (
            displayTests.map((test) => (
              <View key={test.id} style={styles.testCard}>
                <View style={styles.testHeader}>
                  <View style={styles.testInfo}>
                    <Text style={styles.testDate}>{formatDate(test.testDate)}</Text>
                    {user?.role !== 'student' && (
                      <Text style={styles.studentName}>
                        Student ID: {test.studentId}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.scoreContainer,
                    { backgroundColor: getScoreColor(test.score) + '20' }
                  ]}>
                    <Text style={[
                      styles.scoreText,
                      { color: getScoreColor(test.score) }
                    ]}>
                      {test.score}
                    </Text>
                  </View>
                </View>

                <View style={styles.testDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Level:</Text>
                    <Text style={styles.detailValue}>{test.level}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Shuttles:</Text>
                    <Text style={styles.detailValue}>{test.shuttles}</Text>
                  </View>
                </View>

                {test.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{test.notes}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Activity size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {user?.role === 'student' 
                  ? 'No test results yet. Your coach will record your first test soon.'
                  : 'No test results recorded yet.'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Test Modal */}
      <Modal
        isVisible={showAddModal}
        onBackdropPress={() => setShowAddModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Fitness Test</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Select Student */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Student *</Text>
              <View style={styles.studentsList}>
                {studentsLoading ? (
                  <Text style={styles.loadingText}>Loading students...</Text>
                ) : (
                  (students || []).map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      style={[
                        styles.studentOption,
                        selectedStudent === student.id && styles.selectedStudent
                      ]}
                      onPress={() => setSelectedStudent(student.id)}
                    >
                      <Text style={[
                        styles.studentOptionText,
                        selectedStudent === student.id && styles.selectedStudentText
                      ]}>
                        {student.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            {/* YoYo Score */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Yo-Yo Test Score *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 16.3"
                value={testData.yoYoScore}
                onChangeText={(text) => setTestData(prev => ({ ...prev, yoYoScore: text }))}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Sprint 20m */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>20m Sprint Time (s)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3.1"
                value={testData.sprint20m}
                onChangeText={(text) => setTestData(prev => ({ ...prev, sprint20m: text }))}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Vertical Jump */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Vertical Jump</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 42cm"
                value={testData.verticalJump}
                onChangeText={(text) => setTestData(prev => ({ ...prev, verticalJump: text }))}
                placeholderTextColor="#999"
              />
            </View>

            {/* Push-ups */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Push-ups (count)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 35"
                value={testData.pushUps}
                onChangeText={(text) => setTestData(prev => ({ ...prev, pushUps: text }))}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Batting Accuracy */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Batting Accuracy (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 68%"
                value={testData.battingAccuracy}
                onChangeText={(text) => setTestData(prev => ({ ...prev, battingAccuracy: text }))}
                placeholderTextColor="#999"
              />
            </View>

            {/* Bowling Speed */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bowling Speed (km/h)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 121"
                value={testData.bowlingSpeed}
                onChangeText={(text) => setTestData(prev => ({ ...prev, bowlingSpeed: text }))}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Fielding Accuracy */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fielding Accuracy (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 80%"
                value={testData.fieldingAccuracy}
                onChangeText={(text) => setTestData(prev => ({ ...prev, fieldingAccuracy: text }))}
                placeholderTextColor="#999"
              />
            </View>

            {/* Plank Hold */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Plank Hold Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2m 10s"
                value={testData.plankHold}
                onChangeText={(text) => setTestData(prev => ({ ...prev, plankHold: text }))}
                placeholderTextColor="#999"
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Coach Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional observations or comments"
                value={testData.progressNotes}
                onChangeText={(text) => setTestData(prev => ({ ...prev, progressNotes: text }))}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleAddTest}
            >
              <Save size={16} color="#fff" />
              <Text style={styles.saveButtonText}>Save Result</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  infoSection: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  testCard: {
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
  },
  testDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  studentName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  scoreContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  testDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
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
    textAlign: 'center',
    marginTop: 16,
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
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  studentsList: {
    maxHeight: 120,
  },
  studentOption: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedStudent: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  studentOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  selectedStudentText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 8,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
});