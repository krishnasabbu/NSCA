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
import { useAuth } from '@/hooks/useAuth';
import { User, Phone, Award, Target, Activity, Camera, CreditCard as Edit3, Save, FileText, MessageSquare, Mail, Lock } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getUserProfile, updateUserProfile, getUserAchievements, getUserInvoices, submitFeedback, changePassword } from '@/services/api';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // API hooks
  const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useApiData(
    () => getUserProfile(user?.id || ''),
    [user?.id]
  );
  
  const { data: achievements, loading: achievementsLoading } = useApiData(
    () => getUserAchievements(user?.id || ''),
    [user?.id]
  );
  
  const { data: invoices, loading: invoicesLoading } = useApiData(
    () => getUserInvoices(user?.id || ''),
    [user?.id]
  );
  
  const { mutate: updateProfile } = useApiMutation();
  const { mutate: sendFeedback } = useApiMutation();
  const { mutate: changeUserPassword } = useApiMutation();
  
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  });

  React.useEffect(() => {
    if (profileData) {
      setEditData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        age: profileData.age?.toString() || '',
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    const result = await updateProfile((userId, data) => updateUserProfile(userId, data), user?.id || '', {
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      age: parseInt(editData.age) || profileData?.age,
    });
    
    if (result) {
      refetchProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const result = await changeUserPassword((userId, oldPass, newPass) => changePassword(userId, oldPass, newPass), user?.id || '', passwordData.currentPassword, passwordData.newPassword);
    if (result) {
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully!');
    }
  };
  const handleViewInvoices = () => {
    if (invoicesLoading) {
      Alert.alert('Loading', 'Please wait while we load your invoices...');
      return;
    }
    
    const invoiceText = (invoices || [])
      .map(invoice => `• ${invoice.month} - ₹${invoice.amount} (${invoice.status})`)
      .join('\n');
    
    Alert.alert('Invoices', `Invoice history:\n\n${invoiceText}`, [{ text: 'OK' }]);
  };
  
  const handleSubmitFeedback = async () => {
    const result = await sendFeedback((userId, feedback) => submitFeedback(userId, feedback), user?.id || '', 'General feedback');
    if (result) {
      Alert.alert('Feedback Submitted', 'Thank you for your feedback! We will review it and get back to you.', [{ text: 'OK' }]);
    }
  };

  if (profileLoading) {
    return (
      <View style={styles.container}>
        <Header title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const stats = [
    { label: 'Sessions Attended', value: profileData?.stats?.sessionsAttended?.toString() || '0', color: '#2E7D32' },
    { label: 'Batting Average', value: profileData?.stats?.battingAverage?.toString() || '0', color: '#FFD600' },
    { label: 'Best Bowling Speed', value: profileData?.stats?.bestBowlingSpeed || 'N/A', color: '#1976D2' },
    { label: 'Catches Taken', value: profileData?.stats?.catchesTaken?.toString() || '0', color: '#FF6B35' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#fff" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>{user?.role?.toUpperCase()}</Text>
            <View style={styles.phoneContainer}>
              <Phone size={14} color="#666" />
              <Text style={styles.phoneText}>+91 {user?.phone}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Save size={20} color="#2E7D32" />
            ) : (
              <Edit3 size={20} color="#2E7D32" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                />
              ) : (
                <Text style={styles.infoValue}>{profileData?.name}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editData.email}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoValue}>{profileData?.email}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editData.phone}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>+91 {profileData?.phone}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editData.age}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, age: text }))}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.infoValue}>{profileData?.age} years</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skill Level</Text>
              <Text style={styles.infoValue}>{profileData?.skillLevel}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batting Style</Text>
              <Text style={styles.infoValue}>{profileData?.battingStyle}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bowling Style</Text>
              <Text style={styles.infoValue}>{profileData?.bowlingStyle}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fitness Level</Text>
              <Text style={styles.infoValue}>{profileData?.fitnessLevel}</Text>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {achievementsLoading ? (
            <Text style={styles.loadingText}>Loading achievements...</Text>
          ) : (
          <View style={styles.achievementsContainer}>
            {(achievements || []).map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Award size={20} color="#FFD600" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
              </View>
            ))}
          </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleViewInvoices}
            >
              <FileText size={20} color="#2E7D32" />
              <Text style={styles.actionText}>View Invoices</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowPasswordChange(true)}
            >
              <Lock size={20} color="#FF6B35" />
              <Text style={styles.actionText}>Change Password</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSubmitFeedback}
            >
              <MessageSquare size={20} color="#1976D2" />
              <Text style={styles.actionText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Change Modal */}
        {showPasswordChange && (
          <View style={styles.modalOverlay}>
            <View style={styles.passwordModal}>
              <Text style={styles.modalTitle}>Change Password</Text>
              
              <View style={styles.passwordForm}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowPasswordChange(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalSaveButton}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.modalSaveText}>Change Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FFD600',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 6,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
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
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#2E7D32',
    paddingVertical: 4,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 12,
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
  passwordModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordForm: {
    gap: 12,
    marginBottom: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});