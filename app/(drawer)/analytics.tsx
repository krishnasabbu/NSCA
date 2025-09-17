import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { TrendingUp, Users, DollarSign, Calendar, Download, Filter } from 'lucide-react-native';
import Header from '@/components/common/Header';
import { useApiData } from '@/hooks/useApiData';
import { getAnalyticsOverview, getRevenueData, getTopPerformers, getBatchPerformance } from '@/services/api';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // API hooks
  const { data: overview, loading: overviewLoading } = useApiData(() => getAnalyticsOverview());
  const { data: revenueData, loading: revenueLoading } = useApiData(() => getRevenueData());
  const { data: topPerformers, loading: performersLoading } = useApiData(() => getTopPerformers());
  const { data: batchPerformance, loading: batchLoading } = useApiData(() => getBatchPerformance());

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
  ];

  const overviewStats = [
    { title: 'Total Revenue', value: `₹${overview?.totalRevenue?.toLocaleString() || '0'}`, change: '+12%', icon: DollarSign, color: '#2E7D32' },
    { title: 'Active Students', value: overview?.activeStudents?.toString() || '0', change: '+8%', icon: Users, color: '#1976D2' },
    { title: 'Sessions Conducted', value: overview?.sessionsThisMonth?.toString() || '0', change: '+15%', icon: Calendar, color: '#FF6B35' },
    { title: 'Growth Rate', value: `${overview?.growthRate || 0}%`, change: '+3%', icon: TrendingUp, color: '#9C27B0' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Analytics" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.periodSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodContainer}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period.key && styles.activePeriodChip,
                  ]}
                  onPress={() => setSelectedPeriod(period.key)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period.key && styles.activePeriodText,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.exportButton}>
            <Download size={16} color="#2E7D32" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          {overviewLoading ? (
            <Text style={styles.loadingText}>Loading overview...</Text>
          ) : (
          <View style={styles.statsGrid}>
            {overviewStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                    <stat.icon size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.changeText, { color: stat.color }]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Trend</Text>
          {revenueLoading ? (
            <Text style={styles.loadingText}>Loading revenue data...</Text>
          ) : (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Monthly Revenue</Text>
              <Text style={styles.chartSubtitle}>Last 3 months</Text>
            </View>
            
            <View style={styles.chart}>
              {(revenueData || []).map((data, index) => {
                const maxAmount = Math.max(...(revenueData || []).map(d => d.amount));
                const height = (data.amount / maxAmount) * 120;
                
                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height }]} />
                    </View>
                    <Text style={styles.barLabel}>{data.month}</Text>
                    <Text style={styles.barValue}>₹{(data.amount / 1000).toFixed(0)}K</Text>
                  </View>
                );
              })}
            </View>
          </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {performersLoading ? (
            <Text style={styles.loadingText}>Loading performers...</Text>
          ) : (
          <View style={styles.performersContainer}>
            {(topPerformers || []).map((performer, index) => (
              <View key={index} style={styles.performerItem}>
                <View style={styles.performerRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{performer.name}</Text>
                  <Text style={styles.performerBatch}>{performer.batch}</Text>
                </View>
                <View style={styles.performerStats}>
                  <Text style={styles.performerScore}>{performer.score}</Text>
                  <Text style={[styles.performerImprovement, { color: '#2E7D32' }]}>
                    {performer.improvement}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Performance</Text>
          {batchLoading ? (
            <Text style={styles.loadingText}>Loading batch performance...</Text>
          ) : (
          <View style={styles.batchContainer}>
            {(batchPerformance || []).map((batch, index) => (
              <View key={index} style={styles.batchItem}>
                <View style={styles.batchInfo}>
                  <Text style={styles.batchName}>{batch.name}</Text>
                  <Text style={styles.batchStudents}>{batch.students} students</Text>
                </View>
                
                <View style={styles.batchMetrics}>
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{batch.attendance}%</Text>
                    <Text style={styles.metricLabel}>Attendance</Text>
                  </View>
                  
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{batch.rating}</Text>
                    <Text style={styles.metricLabel}>Rating</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          )}
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
  periodSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activePeriodChip: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activePeriodText: {
    color: '#fff',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  exportText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2E7D32',
    marginLeft: 6,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    backgroundColor: '#2E7D32',
    width: 24,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  performersContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD600',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  performerBatch: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  performerScore: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 2,
  },
  performerImprovement: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  batchContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  batchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  batchInfo: {
    flex: 1,
  },
  batchName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  batchStudents: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  batchMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});