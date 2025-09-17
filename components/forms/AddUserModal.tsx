import React, { useEffect, useState } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { X, User, Phone, Mail } from 'lucide-react-native';


// Types
export interface UserType {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'student' | 'coach' | 'admin';
  age?: number;
  batch?: string;
  batchId?: string;
  specialization?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar: string;
  skillLevel?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  fitnessLevel?: string;
  stats?: any;
  experience?: string;
  rating?: number;
  studentsCount?: number;
  permissions?: string[];
  assignedCoachId?: string;
  isFirstLogin?: boolean;
}

// ---------- Types ----------
interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (userData: UserType) => Promise<void>;
  userType: 'student' | 'coach';
}

type Batch = {
  id: string;
  name: string;
};

type UserFormData = {
  name: string;
  phone: string;
  email: string;
  age?: string;
  batchId?: string;
  specialization?: string;
  skillLevel?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  fitnessLevel?: string;
  experience?: string;
  rating?: string;
};

// ---------- Component ----------
export default function AddUserModal({ visible, onClose, onAdd, userType }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    phone: '',
    email: '',
    age: '',
    batchId: '',
    specialization: '',
    skillLevel: '',
    battingStyle: '',
    bowlingStyle: '',
    fitnessLevel: '',
    experience: '',
    rating: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Fetch batches from API when modal opens
  useEffect(() => {
    if (visible && userType === 'student') {
      fetchBatches();
    }
  }, [visible, userType]);

  const fetchBatches = async () => {
    try {
      // Replace with your API
      const res = await fetch('https://api.example.com/batches');
      const data: Batch[] = await res.json();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches', err);
      Alert.alert('Error', 'Unable to fetch batch list');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    const userData: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: `${userType}123`, // default password
      role: userType,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
      isFirstLogin: true,
      ...(userType === 'student' && {
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        batchId: formData.batchId,
        skillLevel: formData.skillLevel,
        battingStyle: formData.battingStyle,
        bowlingStyle: formData.bowlingStyle,
        fitnessLevel: formData.fitnessLevel,
        assignedCoachId: '2',
      }),
      ...(userType === 'coach' && {
        specialization: formData.specialization,
        experience: formData.experience,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        studentsCount: 0,
      }),
    };

    try {
      await onAdd(userData);
      setFormData({
        name: '',
        phone: '',
        email: '',
        age: '',
        batchId: '',
        specialization: '',
        skillLevel: '',
        battingStyle: '',
        bowlingStyle: '',
        fitnessLevel: '',
        experience: '',
        rating: '',
      });
      onClose();

      Alert.alert(
        'User Created Successfully',
        `Default login credentials:\nPhone: ${formData.phone}\nPassword: ${userType}123\n\nUser must change password on first login.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add New {userType === 'student' ? 'Student' : 'Coach'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Common fields */}
          <InputField
            label="Full Name *"
            value={formData.name}
            onChangeText={(val) => setFormData((p) => ({ ...p, name: val }))}
            placeholder="Enter full name"
            icon={<User size={20} color="#666" />}
          />

          <InputField
            label="Phone Number *"
            value={formData.phone}
            onChangeText={(val) => setFormData((p) => ({ ...p, phone: val }))}
            placeholder="Enter 10-digit number"
            keyboardType="numeric"
            icon={<Phone size={20} color="#666" />}
            maxLength={10}
          />

          <InputField
            label="Email Address *"
            value={formData.email}
            onChangeText={(val) => setFormData((p) => ({ ...p, email: val }))}
            placeholder="Enter email address"
            keyboardType="email-address"
            icon={<Mail size={20} color="#666" />}
          />

          {/* Student fields */}
          {userType === 'student' && (
            <>
              <InputField
                label="Age"
                value={formData.age}
                onChangeText={(val) => setFormData((p) => ({ ...p, age: val }))}
                placeholder="Enter age"
                keyboardType="numeric"
              />

              <DropdownField
                label="Batch"
                selectedValue={formData.batchId ?? ''}
                onValueChange={(val: string | number) =>
                  setFormData((p) => ({ ...p, batchId: val.toString() }))
                }
                options={batches.map((b) => ({ label: b.name, value: b.id }))}
              />

              <DropdownField
                label="Skill Level"
                selectedValue={formData.skillLevel ?? ''}
                onValueChange={(val: string | number) =>
                  setFormData((p) => ({ ...p, skillLevel: val.toString() }))
                }
                options={[
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Advanced', value: 'Advanced' },
                ]}
              />

              <DropdownField
                label="Batting Style"
                selectedValue={formData.battingStyle ?? ''}
                onValueChange={(val: string | number) =>
                  setFormData((p) => ({ ...p, battingStyle: val.toString() }))
                }
                options={[
                  { label: 'Right-handed', value: 'Right-handed' },
                  { label: 'Left-handed', value: 'Left-handed' },
                ]}
              />

              <DropdownField
                label="Bowling Style"
                selectedValue={formData.bowlingStyle ?? ''}
                onValueChange={(val: string | number) =>
                  setFormData((p) => ({ ...p, bowlingStyle: val.toString() }))
                }
                options={[
                  { label: 'Fast', value: 'Fast' },
                  { label: 'Spin', value: 'Spin' },
                  { label: 'Medium Pace', value: 'Medium Pace' },
                ]}
              />

              <DropdownField
                label="Fitness Level"
                selectedValue={formData.fitnessLevel ?? ''}
                onValueChange={(val: string | number) =>
                  setFormData((p) => ({ ...p, fitnessLevel: val.toString() }))
                }
                options={[
                  { label: 'Low', value: 'Low' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'High', value: 'High' },
                ]}
              />
            </>
          )}

          {/* Coach fields */}
          {userType === 'coach' && (
            <>
              <InputField
                label="Specialization"
                value={formData.specialization}
                onChangeText={(val) => setFormData((p) => ({ ...p, specialization: val }))}
                placeholder="e.g., Batting Coach"
              />

              <InputField
                label="Experience"
                value={formData.experience}
                onChangeText={(val) => setFormData((p) => ({ ...p, experience: val }))}
                placeholder="Enter years of experience"
              />

              <InputField
                label="Rating"
                value={formData.rating}
                onChangeText={(val) => setFormData((p) => ({ ...p, rating: val }))}
                placeholder="1-5"
                keyboardType="numeric"
              />
            </>
          )}
        </ScrollView>

        {/* Footer */}
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
              {isSubmitting ? 'Adding...' : `Add ${userType === 'student' ? 'Student' : 'Coach'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ---------- Reusable Components ----------
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  icon,
  maxLength,
}: {
  label: string;
  value?: string;
  onChangeText: (val: string) => void;
  placeholder: string;
  keyboardType?: any;
  icon?: React.ReactNode;
  maxLength?: number;
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      {icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
    </View>
  </View>
);

interface DropdownOption {
  label: string;
  value: string | number;
}

const DropdownField = ({
  label,
  selectedValue,
  onValueChange,
  options,
}: {
  label: string;
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  options: DropdownOption[];
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.dropdownContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(val) => onValueChange(val)}
        style={{ height: 50, color: '#333' }}
      >
        <Picker.Item label={`Select ${label}`} value="" />
        {options.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  </View>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  closeButton: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#f8f9fa',
  },
  content: { flex: 1, padding: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  input: { flex: 1, fontSize: 16, color: '#333', marginLeft: 12 },
  dropdownContainer: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0',
  },
  footer: {
    flexDirection: 'row', padding: 20, gap: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#f8f9fa', alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  submitButton: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#2E7D32', alignItems: 'center',
  },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  submitButtonDisabled: { opacity: 0.6 },
});