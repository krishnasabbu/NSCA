import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Calendar, Clock, MapPin, Users, Target } from 'lucide-react-native';

interface ScheduleSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sessionData: any) => void;
}

export default function ScheduleSessionModal({ visible, onClose, onAdd }: ScheduleSessionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxStudents: '',
    description: '',
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const sessionData = {
      id: Date.now().toString(),
      title: formData.title,
      time: `${formData.startTime} - ${formData.endTime}`,
      location: formData.location || 'Ground A',
      students: 0,
      maxStudents: parseInt(formData.maxStudents) || 15,
      status: 'upcoming',
      date: formData.date,
      description: formData.description,
    };

    onAdd(sessionData);
    setFormData({
      title: '',
      date: '',
      startTime: '',
      endTime: '',
    }
    )
    const sessionToCreate = {
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || 'Ground A',
      batchId: '1', // Default batch
      coachId: '2', // Default coach
      students: 0,
      maxStudents: parseInt(formData.maxStudents) || 15,
      status: 'upcoming' as const,
      description: formData.description || '',
    };
    
    onAdd(sessionToCreate);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule New Session</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Session Title *</Text>
              <View style={styles.inputContainer}>
                <Target size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Batting Practice - U-16"
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Start Time *</Text>
                <View style={styles.inputContainer}>
                  <Clock size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="9:00 AM"
                    value={formData.startTime}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>End Time *</Text>
                <View style={styles.inputContainer}>
                  <Clock size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="11:00 AM"
                    value={formData.endTime}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Ground A"
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Maximum Students</Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 15"
                  value={formData.maxStudents}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxStudents: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <View style={styles.inputContainer}>
                <Target size={20} color="#666" />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the session objectives and activities"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Schedule Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginLeft: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
  },
  typeContainer: {
    gap: 12,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  typeTextActive: {
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  uploadSection: {
    marginTop: 10,
  },
  uploadButton: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});