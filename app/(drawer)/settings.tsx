import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Building, Globe, Image, Bell, Shield, CircleHelp as HelpCircle, FileText, Camera, Save } from 'lucide-react-native';
import { Send } from 'lucide-react-native';
import Header from '@/components/common/Header';
import SendNotificationModal from '@/components/forms/SendNotificationModal';
import { useAuth } from '@/hooks/useAuth';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getAcademySettings, updateAcademySettings, sendBulkNotifications } from '@/services/api';

export default function SettingsScreen() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [settings, setSettings] = useState({
    allowRegistrations: true,
    requireApproval: false,
    enableNotifications: true,
  });
  
  // Only show settings for admin
  if (user?.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Header title="Settings" />
        <View style={styles.restrictedContainer}>
          <Text style={styles.restrictedText}>
            Settings are only available for administrators
          </Text>
        </View>
      </View>
    );
  }
  
  // API hooks
  const { data: academySettings, loading, refetch } = useApiData(() => getAcademySettings());
  const { mutate: updateSettings } = useApiMutation();
  const { mutate: sendNotifications } = useApiMutation();
  
  const [editData, setEditData] = useState({
    name: '',
    website: '',
    about: '',
  });

  React.useEffect(() => {
    if (academySettings) {
      setEditData({
        name: academySettings.name || '',
        website: academySettings.website || '',
        about: academySettings.about || '',
      });
    }
  }, [academySettings]);

  const handleSave = async () => {
    const updatedSettings = {
      ...academySettings,
      ...editData,
    };
    
    const result = await updateSettings(updateAcademySettings, updatedSettings);
    if (result) {
      refetch();
      setIsEditing(false);
      Alert.alert('Success', 'Academy settings updated successfully!');
    }
  };

  const handleUploadLogo = () => {
    Alert.alert('Upload Logo', 'Logo has been updated successfully!', [
      { text: 'OK' }
    ]);
  };

  const handleUploadGallery = () => {
    Alert.alert('Gallery Updated', 'Academy photos have been uploaded successfully!', [
      { text: 'OK' }
    ]);
  };

  const handleSendNotification = async (title: string, message: string, userIds: string[], type: string) => {
    const result = await sendNotifications(
      (title, message, userIds, type) => sendBulkNotifications(title, message, userIds, type),
      title,
      message,
      userIds,
      type
    );
    
    if (result) {
      Alert.alert('Success', `Notification sent to ${userIds.length} users successfully!`);
    }
  };

  const settingSections = [
    {
      title: 'General Settings',
      items: [
        { icon: Bell, title: 'Push Notifications', subtitle: 'Enable app notifications', hasSwitch: true, key: 'enableNotifications' },
        { 
          icon: Shield, 
          title: 'Privacy Policy', 
          subtitle: 'View privacy policy', 
          onPress: () => Alert.alert('Privacy Policy', 'Your privacy is important to us. We collect and use your data only for academy management purposes.', [{ text: 'OK' }])
        },
        { 
          icon: HelpCircle, 
          title: 'Help & Support', 
          subtitle: 'Get help and support', 
          onPress: () => Alert.alert('Help & Support', 'For support, contact us at:\n\nEmail: support@naturespacecricket.com\nPhone: +91 98765 43210', [{ text: 'OK' }])
        },
        { 
          icon: FileText, 
          title: 'Terms of Service', 
          subtitle: 'View terms and conditions', 
          onPress: () => Alert.alert('Terms of Service', 'By using this app, you agree to our terms and conditions for academy services.', [{ text: 'OK' }])
        },
      ],
    },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Academy Settings" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Academy Settings" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Academy Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.academyContainer}>
            <View style={styles.logoSection}>
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoEmoji}>🏏</Text>
              </View>
              <TouchableOpacity style={styles.uploadLogoButton} onPress={handleUploadLogo}>
                <Camera size={16} color="#2E7D32" />
                <Text style={styles.uploadLogoText}>Change Logo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Academy Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.formInput}
                    value={editData.name}
                    onChangeText={(text) => 
                      setEditData(prev => ({ ...prev, name: text }))
                    }
                  />
                ) : (
                  <Text style={styles.formValue}>{academySettings?.name}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Website</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.formInput}
                    value={editData.website}
                    onChangeText={(text) => 
                      setEditData(prev => ({ ...prev, website: text }))
                    }
                  />
                ) : (
                  <Text style={styles.formValue}>{academySettings?.website}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>About Academy</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={editData.about}
                    onChangeText={(text) => 
                      setEditData(prev => ({ ...prev, about: text }))
                    }
                    multiline
                    numberOfLines={4}
                  />
                ) : (
                  <Text style={styles.formValue}>{academySettings?.about}</Text>
                )}
              </View>

              {isEditing && (
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Save size={16} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Allow New Registrations</Text>
                <Text style={styles.settingDescription}>
                  Enable new students to register through the app
                </Text>
              </View>
              <Switch
                value={settings.allowRegistrations}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, allowRegistrations: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Require Admin Approval</Text>
                <Text style={styles.settingDescription}>
                  New registrations need admin approval before activation
                </Text>
              </View>
              <Switch
                value={settings.requireApproval}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, requireApproval: value }))
                }
                trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          <View style={styles.communicationContainer}>
            <TouchableOpacity 
              style={styles.notificationButton} 
              onPress={() => setShowNotificationModal(true)}
            >
              <Send size={24} color="#2E7D32" />
              <Text style={styles.notificationButtonText}>Send Notification</Text>
              <Text style={styles.notificationButtonSubtext}>Send announcements to students & coaches</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media Gallery</Text>
          <View style={styles.galleryContainer}>
            <TouchableOpacity style={styles.galleryButton} onPress={handleUploadGallery}>
              <Image size={24} color="#2E7D32" />
              <Text style={styles.galleryButtonText}>Manage Gallery</Text>
              <Text style={styles.galleryButtonSubtext}>Upload academy photos & videos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsContainer}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                >
                  <View style={styles.settingIcon}>
                    <item.icon size={20} color="#666" />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.subtitle}</Text>
                  </View>
                  {item.hasSwitch && item.key && (
                    <Switch
                      value={settings.enableNotifications}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, enableNotifications: value }))
                      }
                      trackColor={{ false: '#e0e0e0', true: '#2E7D32' }}
                      thumbColor="#fff"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      
      <SendNotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={handleSendNotification}
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  academyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 40,
  },
  uploadLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
  },
  uploadLogoText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginLeft: 6,
  },
  infoForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    paddingVertical: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  galleryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  galleryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 4,
  },
  galleryButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  communicationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationButton: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  notificationButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 4,
  },
  notificationButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
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
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restrictedText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});