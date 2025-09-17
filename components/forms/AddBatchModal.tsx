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
import { X, Users, Calendar, MapPin, Target, Clock } from 'lucide-react-native';
import { useApiData } from '@/hooks/useApiData';
import { getCoaches } from '@/services/api';

interface AddBatchModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (batchData: any) => Promise<void>;
}

export default function AddBatchModal({ visible, onClose, onAdd }: AddBatchModalProps) {
  const { data: coaches, loading: coachesLoading } = useApiData(() => getCoaches());
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'All-round',
    ageGroup: '',
    coachId: '',
    maxStudents: '',
    schedule: '',
    location: '',
  });

  const categories = ['Batting', 'Bowling', 'Fielding', 'All-round'];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.ageGroup || !formData.coachId || !formData.maxStudents) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const selectedCoach = coaches?.find(coach => coach.id === formData.coachId);

    const batchData = {
      name: formData.name,
      category: formData.category,
      ageGroup: formData.ageGroup,
      coach: selectedCoach?.name || 'Unknown Coach',
      coachId: formData.coachId,
      students: 0,
      maxStudents: parseInt(formData.maxStudents),
      schedule: formData.schedule || 'TBD',
      location: formData.location || 'Ground A',
      startDate: new Date().toISOString().split('T')[0],
      status: 'upcoming',
      fees: 5000, // Default fees
    };

    try {
      await onAdd(batchData);
      setFormData({
        name: '',
        category: 'All-round',
        ageGroup: '',
        coachId: '',
        maxStudents: '',
        schedule: '',
        location: '',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Batch</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Batch Name *</Text>
              <View style={styles.inputContainer}>
                <Target size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., U-16 Batting Specialists"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category && styles.categoryChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, category }))}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.category === category && styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Age Group *</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Under 16"
                  value={formData.ageGroup}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, ageGroup: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assigned Coach *</Text>
              {coachesLoading ? (
                <Text style={styles.loadingText}>Loading coaches...</Text>
              ) : (
                <View style={styles.coachesContainer}>
                  {(coaches || []).map((coach) => (
                    <TouchableOpacity
                      key={coach.id}
                      style={[
                        styles.coachOption,
                        formData.coachId === coach.id && styles.selectedCoach
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, coachId: coach.id }))}
                    >
                      <Text style={[
                        styles.coachOptionText,
                        formData.coachId === coach.id && styles.selectedCoachText
                      ]}>
                        {coach.name}
                      </Text>
                      <Text style={[
                        styles.coachSpecialization,
                        formData.coachId === coach.id && styles.selectedCoachSpecialization
                      ]}>
                        {coach.specialization}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Maximum Students *</Text>
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
              <Text style={styles.label}>Schedule</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
                  value={formData.schedule}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, schedule: text }))}
                  placeholderTextColor="#999"
                />
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
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </Text>
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
    alignItems: 'center',
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
  countryCode: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
    marginRight: 8,
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
  coachesContainer: {
    maxHeight: 120,
    gap: 8,
  },
  coachOption: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCoach: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  coachOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  selectedCoachText: {
    color: '#fff',
  },
  coachSpecialization: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  selectedCoachSpecialization: {
    color: '#E8F5E8',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});