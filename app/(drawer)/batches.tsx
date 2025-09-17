import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus, Users, Calendar, MapPin, CreditCard as Edit, Trash2, UserPlus, Clock } from 'lucide-react-native';
import Header from '@/components/common/Header';
import AddBatchModal from '@/components/forms/AddBatchModal';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getBatches, createBatch, deleteBatch, Batch } from '@/services/api';


export default function BatchesScreen() {
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [showAddModal, setShowAddModal] = useState(false);

  // API hooks
  const { data: batchesList, loading, error, refetch } = useApiData(() => getBatches());
  
  const { mutate: createBatchMutation } = useApiMutation<Batch>();
  const { mutate: deleteBatchMutation } = useApiMutation<boolean>();

  const statusOptions = ['active', 'upcoming', 'completed'];

  console.log("batchesList ==== "+JSON.stringify(batchesList));

  const filteredBatches = Array.isArray(batchesList) 
  ? batchesList.filter(batch => batch.status === selectedStatus) 
  : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Batting': return '#2E7D32';
      case 'Bowling': return '#1976D2';
      case 'Fielding': return '#FF6B35';
      case 'All-round': return '#9C27B0';
      default: return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'completed': return '#666';
      default: return '#666';
    }
  };

  const handleCreateBatch = () => {
    setShowAddModal(true);
  };

  const handleAddBatch = async (batchData: Omit<Batch, 'id'>) => {
    const result = await createBatchMutation((data) => createBatch(data), batchData);
    if (result) {
      refetch();
      Alert.alert('Success', 'Batch created successfully!');
    }
  };

  const handleEditBatch = (batchName: string) => {
    Alert.alert('Info', `Edit ${batchName} feature coming soon!`);
  };

  const handleDeleteBatch = async (batchId: string, batchName: string) => {
    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${batchName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          const result = await deleteBatchMutation((id) => deleteBatch(id), batchId);
          if (result) {
            refetch();
            Alert.alert('Success', 'Batch deleted successfully!');
          }
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Batch Management" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading batches...</Text>
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

        <View style={styles.headerSection}>
          <View style={styles.statusTabs}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusTab,
                  selectedStatus === status && styles.activeStatusTab,
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    selectedStatus === status && styles.activeStatusTabText,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateBatch}>
            <Plus size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.batchesSection}>
          <Text style={styles.sectionTitle}>
            {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Batches ({filteredBatches.length})
          </Text>
          
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => (
              <View key={batch.id} style={styles.batchCard}>
                <View style={styles.batchHeader}>
                  <View style={styles.batchTitleContainer}>
                    <Text style={styles.batchName}>{batch.name}</Text>
                    <View style={[
                      styles.categoryTag,
                      { backgroundColor: getCategoryColor(batch.category) + '20' }
                    ]}>
                      <Text style={[
                        styles.categoryText,
                        { color: getCategoryColor(batch.category) }
                      ]}>
                        {batch.category}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.batchActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditBatch(batch.name)}
                    >
                      <Edit size={16} color="#2E7D32" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteBatch(batch.id, batch.name)}
                    >
                      <Trash2 size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.batchDetails}>
                  <View style={styles.detailRow}>
                    <Users size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {batch.students}/{batch.maxStudents} students • {batch.ageGroup}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#666" />
                    <Text style={styles.detailText}>{batch.schedule}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.detailText}>{batch.location}</Text>
                  </View>
                </View>

                <View style={styles.batchFooter}>
                  <View style={styles.coachInfo}>
                    <Text style={styles.coachLabel}>Coach:</Text>
                    <Text style={styles.coachName}>{batch.coach}</Text>
                  </View>
                  
                  <View style={styles.enrollmentContainer}>
                    <View style={styles.enrollmentBar}>
                      <View 
                        style={[
                          styles.enrollmentFill,
                          { width: `${(batch.students / batch.maxStudents) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.enrollmentText}>
                      {Math.round((batch.students / batch.maxStudents) * 100)}% full
                    </Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(batch.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(batch.status) }
                    ]}>
                      {batch.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {selectedStatus} batches found
              </Text>
              <TouchableOpacity style={styles.createEmptyButton} onPress={handleCreateBatch}>
                <Plus size={20} color="#2E7D32" />
                <Text style={styles.createEmptyText}>Create New Batch</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      <AddBatchModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddBatch}
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeStatusTab: {
    backgroundColor: '#2E7D32',
  },
  statusTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeStatusTabText: {
    color: '#fff',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  batchesSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  batchTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  batchName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  batchActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  batchDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 8,
  },
  batchFooter: {
    gap: 12,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 8,
  },
  coachName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#2E7D32',
  },
  enrollmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enrollmentBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginRight: 12,
  },
  enrollmentFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  enrollmentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
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
    marginBottom: 16,
    textAlign: 'center',
  },
  createEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  createEmptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginLeft: 8,
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