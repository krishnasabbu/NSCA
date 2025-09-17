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
import { X, Send, Users, MessageSquare } from 'lucide-react-native';
import { useApiData } from '@/hooks/useApiData';
import { getUsers } from '@/services/api';

interface SendNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (title: string, message: string, userIds: string[], type: string) => Promise<void>;
}

export default function SendNotificationModal({ visible, onClose, onSend }: SendNotificationModalProps) {
  const { data: users, loading } = useApiData(() => getUsers());
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetAudience: 'all',
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notificationTypes = [
    { key: 'announcement', label: 'Announcement' },
    { key: 'session', label: 'Session Update' },
    { key: 'achievement', label: 'Achievement' },
    { key: 'feedback', label: 'Feedback' },
  ];

  const audienceOptions = [
    { key: 'all', label: 'All Users' },
    { key: 'students', label: 'All Students' },
    { key: 'coaches', label: 'All Coaches' },
    { key: 'custom', label: 'Select Users' },
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      Alert.alert('Error', 'Please fill in title and message');
      return;
    }

    setIsSubmitting(true);

    try {
      let targetUserIds: string[] = [];

      if (formData.targetAudience === 'all') {
        targetUserIds = (users || []).map(user => user.id);
      } else if (formData.targetAudience === 'students') {
        targetUserIds = (users || []).filter(user => user.role === 'student').map(user => user.id);
      } else if (formData.targetAudience === 'coaches') {
        targetUserIds = (users || []).filter(user => user.role === 'coach').map(user => user.id);
      } else if (formData.targetAudience === 'custom') {
        targetUserIds = selectedUsers;
      }

      if (targetUserIds.length === 0) {
        Alert.alert('Error', 'Please select at least one recipient');
        return;
      }

      await onSend(formData.title, formData.message, targetUserIds, formData.type);
      
      // Reset form
      setFormData({ title: '', message: '', type: 'announcement', targetAudience: 'all' });
      setSelectedUsers([]);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Send Notification</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notification Type</Text>
              <View style={styles.typeContainer}>
                {notificationTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeChip,
                      formData.type === type.key && styles.typeChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.key }))}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        formData.type === type.key && styles.typeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Target Audience</Text>
              <View style={styles.audienceContainer}>
                {audienceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.audienceChip,
                      formData.targetAudience === option.key && styles.audienceChipActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, targetAudience: option.key }))}
                  >
                    <Text
                      style={[
                        styles.audienceText,
                        formData.targetAudience === option.key && styles.audienceTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.targetAudience === 'custom' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Select Users</Text>
                <View style={styles.usersList}>
                  {loading ? (
                    <Text style={styles.loadingText}>Loading users...</Text>
                  ) : (
                    (users || []).filter(user => user.role !== 'admin').map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={[
                          styles.userOption,
                          selectedUsers.includes(user.id) && styles.selectedUser
                        ]}
                        onPress={() => toggleUserSelection(user.id)}
                      >
                        <Text style={[
                          styles.userOptionText,
                          selectedUsers.includes(user.id) && styles.selectedUserText
                        ]}>
                          {user.name} ({user.role})
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <View style={styles.inputContainer}>
                <MessageSquare size={20} color="#666" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your message"
                  value={formData.message}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
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
          <TouchableOpacity 
            style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Send size={16} color="#fff" />
            <Text style={styles.sendButtonText}>
              {isSubmitting ? 'Sending...' : 'Send Notification'}
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
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
  },
  typeTextActive: {
    color: '#fff',
  },
  audienceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  audienceChipActive: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  audienceText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  audienceTextActive: {
    color: '#fff',
  },
  usersList: {
    maxHeight: 200,
    gap: 8,
  },
  userOption: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedUser: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  userOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  selectedUserText: {
    color: '#fff',
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
    marginLeft: 0,
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
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 12,
  },
});