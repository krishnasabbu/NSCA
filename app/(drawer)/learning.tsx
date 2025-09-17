import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Search, Play, Bookmark, Filter } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useApiData, useApiMutation } from '@/hooks/useApiData';
import { getContent, updateContent, Content } from '@/services/api';

export default function LearningScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // API hooks
  const { data: contentList, loading, error, refetch } = useApiData(() => getContent());
  const { mutate: updateContentMutation } = useApiMutation<Content>();

  const categories = ['All', 'Batting', 'Bowling', 'Fielding', 'Fitness'];

  const toggleBookmark = async (contentId: string) => {
    const content = contentList?.find(item => item.id === contentId);
    if (content) {
      const result = await updateContentMutation(
        (data) => updateContent(contentId, data),
        { isBookmarked: !content.isBookmarked }
      );
      if (result) {
        refetch();
      }
    }
  };

  const filteredContent = (contentList || []).filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Learning Hub" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tutorials..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.tutorialsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Content' : `${selectedCategory} Content`}
          </Text>
          
          {filteredContent.map((content) => (
            <TouchableOpacity key={content.id} style={styles.tutorialCard}>
              <Image source={{ uri: content.thumbnail }} style={styles.thumbnail} />
              
              <View style={styles.tutorialContent}>
                <View style={styles.tutorialHeader}>
                  <Text style={styles.tutorialTitle}>{content.title}</Text>
                  <TouchableOpacity 
                    style={styles.bookmarkButton}
                    onPress={() => toggleBookmark(content.id)}
                  >
                    <Bookmark 
                      size={20} 
                      color={content.isBookmarked ? '#FFD600' : '#ccc'}
                      fill={content.isBookmarked ? '#FFD600' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tutorialMeta}>
                  <Text style={styles.duration}>{content.duration}</Text>
                  <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(content.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(content.difficulty) }]}>
                      {content.difficulty}
                    </Text>
                  </View>
                </View>

                {(content.progress || 0) > 0 && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${content.progress || 0}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{content.progress || 0}%</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => Alert.alert('Playing', `Now playing: ${content.title}`)}
              >
                <Play size={24} color="#fff" fill="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
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
  categoriesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
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
  tutorialsSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  tutorialCard: {
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
  tutorialContent: {
    padding: 16,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tutorialTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 12,
  },
  bookmarkButton: {
    padding: 4,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 12,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#F44336',
  },
  playButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});