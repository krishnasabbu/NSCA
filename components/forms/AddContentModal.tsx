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
import { X, Video, FileText, Upload, Target, Clock } from 'lucide-react-native';

interface AddContentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (contentData: any) => Promise<void>;
}

export default function AddContentModal({ visible, onClose, onAdd }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    category: 'Batting',
    difficulty: 'Beginner',
    duration: '',
    description: '',
  });

  const types = ['video', 'drill'];
  const categories = ['Batting', 'Bowling', 'Fielding', 'Fitness'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const contentData = {
      title: formData.title,
      type: formData.type,
      category: formData.category,
      difficulty: formData.difficulty,
      duration: formData.duration || '10:00',
      thumbnail: `https://images.pexels.com/photos/166195${Math.floor(Math.random() * 9) + 0}/pexels-photo-166195${Math.floor(Math.random() * 9) + 0}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      views: 0,
      likes: 0,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      description: formData.description,
      authorId: '2', // Default author
      author: 'Coach Virat',
    };

    try {
      await onAdd(contentData);
      setFormData({
        title: '',
        type: 'video',
        category: 'Batting',
        difficulty: 'Beginner',
        duration: '',
        description: '',
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
          <Text style={styles.title}>Upload New Content</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Content Title *</Text>
              <View style={styles.inputContainer}>
                <FileText size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter content title"
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Content Type *</Text>
              <View style={styles.typeContainer}>
                {types.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      formData.type === type && styles.typeChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type }))}
                  >
                    {type === 'video' ? (
                      <Video size={16} color={formData.type === type ? '#fff' : '#666'} />
                    ) : (
                      <FileText size={16} color={formData.type === type ? '#fff' : '#666'} />
                    )}
                    <Text
                      style={[
                        styles.typeText,
                        formData.type === type && styles.typeTextActive,
                      ]}
                    >
                      {type === 'video' ? 'Video Tutorial' : 'Training Drill'}
                    </Text>
                  </TouchableOpacity>
                ))}
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
              <Text style={styles.label}>Difficulty Level *</Text>
              <View style={styles.categoryContainer}>
                {difficulties.map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.categoryChip,
                      formData.difficulty === difficulty && styles.categoryChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, difficulty }))}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        formData.difficulty === difficulty && styles.categoryTextActive,
                      ]}
                    >
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12:30"
                  value={formData.duration}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, duration: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <View style={styles.inputContainer}>
                <FileText size={20} color="#666" />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the content and what students will learn"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.uploadSection}>
              <TouchableOpacity style={styles.uploadButton}>
                <Upload size={24} color="#2E7D32" />
                <Text style={styles.uploadText}>Upload {formData.type === 'video' ? 'Video' : 'Document'}</Text>
                <Text style={styles.uploadSubtext}>
                  {formData.type === 'video' ? 'MP4, MOV up to 500MB' : 'PDF, DOC up to 50MB'}
                </Text>
              </TouchableOpacity>
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
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
});