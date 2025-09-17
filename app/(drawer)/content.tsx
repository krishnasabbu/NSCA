import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Upload, Play, CreditCard as Edit, Trash2, Plus, Video, FileText } from 'lucide-react-native';
import Header from '@/components/common/Header';
import AddContentModal from '@/components/forms/AddContentModal';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getContent, createContent, updateContent, deleteContent, Content } from '@/services/api';


export default function ContentScreen() {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts'>('published');
  const [showAddModal, setShowAddModal] = useState(false);

  // API hooks
  const { data: contentList, loading, error, refetch } = useApiData(() => getContent());
  const { mutate: createContentMutation } = useApiMutation<Content>();
  const { mutate: updateContentMutation } = useApiMutation<Content>();
  const { mutate: deleteContentMutation } = useApiMutation<boolean>();

  const publishedContent = (contentList || []).filter(item => item.status === 'published');
  const draftContent = (contentList || []).filter(item => item.status === 'draft');

  const handleUpload = () => {
    setShowAddModal(true);
  };

  const handleAddContent = async (contentData: Omit<Content, 'id'>) => {
    const result = await createContentMutation(createContent, contentData);
    if (result) {
      refetch();
      Alert.alert('Success', 'Content added successfully!');
    }
  };

  const handlePublishContent = async (contentId: string) => {
    const result = await updateContentMutation(
      updateContent,
      { id: contentId, status: 'published', uploadDate: new Date().toISOString().split('T')[0] }
    );
    if (result) {
      refetch();
      Alert.alert('Success', 'Content published successfully!');
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          const result = await deleteContentMutation(deleteContent, contentId);
          if (result) {
            refetch();
            Alert.alert('Success', 'Content deleted successfully!');
          }
        }},
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  const renderContentItem = (item: Content) => (
    <View key={item.id} style={styles.contentCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      
      <View style={styles.contentInfo}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{item.title}</Text>
          <View style={styles.contentActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Edit size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteContent(item.id)}
            >
              <Trash2 size={16} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentMeta}>
          <View style={styles.metaRow}>
            <View style={styles.typeContainer}>
              {item.type === 'video' ? (
                <Video size={14} color="#1976D2" />
              ) : (
                <FileText size={14} color="#FF6B35" />
              )}
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
            
            <View style={[
              styles.difficultyTag,
              { backgroundColor: getDifficultyColor(item.difficulty) + '20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: getDifficultyColor(item.difficulty) }
              ]}>
                {item.difficulty}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.categoryText}>{item.category}</Text>
            {item.duration && (
              <Text style={styles.durationText}>{item.duration}</Text>
            )}
          </View>
        </View>

        {item.status === 'published' && (
          <View style={styles.statsRow}>
            <Text style={styles.statText}>{item.views} views</Text>
            <Text style={styles.statText}>{item.likes} likes</Text>
            <Text style={styles.uploadDate}>{item.uploadDate}</Text>
          </View>
        )}

        {item.status === 'draft' && (
          <View style={styles.draftActions}>
            <TouchableOpacity 
              style={styles.publishButton}
              onPress={() => handlePublishContent(item.id)}
            >
              <Text style={styles.publishButtonText}>Publish</Text>
            </TouchableOpacity>
            <Text style={styles.draftText}>Draft • {item.uploadDate}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Content Management" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading content...</Text>
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
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'published' && styles.activeTab]}
              onPress={() => setActiveTab('published')}
            >
              <Text style={[styles.tabText, activeTab === 'published' && styles.activeTabText]}>
                Published ({publishedContent.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
              onPress={() => setActiveTab('drafts')}
            >
              <Text style={[styles.tabText, activeTab === 'drafts' && styles.activeTabText]}>
                Drafts ({draftContent.length})
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Upload size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentSection}>
          {activeTab === 'published' ? (
            publishedContent.length > 0 ? (
              publishedContent.map(renderContentItem)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No published content yet</Text>
                <TouchableOpacity style={styles.uploadEmptyButton} onPress={handleUpload}>
                  <Plus size={20} color="#2E7D32" />
                  <Text style={styles.uploadEmptyText}>Upload Your First Content</Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            draftContent.length > 0 ? (
              draftContent.map(renderContentItem)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No drafts saved</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
      
      <AddContentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContent}
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  contentInfo: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contentTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 12,
  },
  contentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  contentMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  uploadDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publishButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  draftText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF9800',
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
  uploadEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  uploadEmptyText: {
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