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
import { Search, Filter, Plus, CreditCard as Edit, Trash2, UserPlus, Users } from 'lucide-react-native';
import Header from '@/components/common/Header';
import AddUserModal from '@/components/forms/AddUserModal';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getUsers, createUser, deleteUser, User } from '@/services/api';


export default function UsersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserType, setAddUserType] = useState<'student' | 'coach'>('student');

  // API hooks
  const { data: usersList, loading, error, refetch } = useApiData(() => getUsers());
  const { mutate: createUserMutation } = useApiMutation<User>();
  const { mutate: deleteUserMutation } = useApiMutation<boolean>();

  const roles = ['All', 'Student', 'Coach'];

  const filteredUsers = (usersList || []).filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesRole = selectedRole === 'All' || 
                       user.role === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    const result = await createUserMutation(createUser, userData);
    if (result) {
      refetch();
      Alert.alert('Success', 'User created successfully!');
    }
  };

  const handleAddUserPress = () => {
    Alert.alert(
      'Add New User',
      'Select user type to add',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Student', 
          onPress: () => {
            setAddUserType('student');
            setShowAddModal(true);
          }
        },
        { 
          text: 'Add Coach', 
          onPress: () => {
            setAddUserType('coach');
            setShowAddModal(true);
          }
        },
      ]
    );
  };


  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          const result = await deleteUserMutation(deleteUser, userId);
          if (result) {
            refetch();
            Alert.alert('Success', `${userName} has been deleted successfully`);
          }
        }},
      ]
    );
  };

  const studentCount = (usersList || []).filter(u => u.role === 'student').length;
  const coachCount = (usersList || []).filter(u => u.role === 'coach').length;

  return (
    <View style={styles.container}>
      <Header title="User Management" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Users size={24} color="#2E7D32" />
            <Text style={styles.statNumber}>{studentCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          
          <View style={styles.statCard}>
            <UserPlus size={24} color="#FFD600" />
            <Text style={styles.statNumber}>{coachCount}</Text>
            <Text style={styles.statLabel}>Coaches</Text>
          </View>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterChip,
                    selectedRole === role && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedRole === role && styles.filterTextActive,
                    ]}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.addUserButton} onPress={handleAddUserPress}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>
            Users ({filteredUsers.length})
          </Text>
          
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.userContent}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={styles.editButton}>
                      <Edit size={16} color="#2E7D32" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user.id, user.name)}
                    >
                      <Trash2 size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.userMeta}>
                  <Text style={styles.userPhone}>+91 {user.phone}</Text>
                  <View style={[
                    styles.roleTag,
                    { backgroundColor: user.role === 'student' ? '#E8F5E8' : '#FFF9C4' }
                  ]}>
                    <Text style={[
                      styles.roleText,
                      { color: user.role === 'student' ? '#2E7D32' : '#F57F17' }
                    ]}>
                      {user.role.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {user.role === 'student' && (
                  <View style={styles.studentInfo}>
                    <Text style={styles.infoText}>Age: {user.age}</Text>
                    <Text style={styles.infoText}>Batch: {user.batch}</Text>
                  </View>
                )}

                {user.role === 'coach' && (
                  <View style={styles.coachInfo}>
                    <Text style={styles.infoText}>Specialization: {user.specialization}</Text>
                  </View>
                )}

                <View style={styles.userFooter}>
                  <Text style={styles.joinDate}>Joined: {user.joinDate}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: user.status === 'active' ? '#E8F5E8' : '#FFEBEE' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: user.status === 'active' ? '#2E7D32' : '#F44336' }
                    ]}>
                      {user.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddUser}
        userType={addUserType}
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
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addUserButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  userContent: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  studentInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  coachInfo: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
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
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});