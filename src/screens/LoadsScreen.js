import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getLoads } from '../lib/api';
import { colors } from '../lib/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import Section from '../components/Section';

const theme = colors.dark;

const STATUS_COLORS = {
  pending: theme.status.warning,
  completed: theme.status.success,
  cancelled: theme.status.error,
};

const STATUS_LABELS = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function LoadsScreen() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [stats, setStats] = useState({
    totalLoads: 0,
    completedLoads: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadLoads();
  }, [selectedStatus]);

  const loadLoads = async () => {
    try {
      setLoading(true);
      const filters = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      const data = await getLoads(filters);
      setLoads(data.loads || []);

      const totalRevenue = (data.loads || []).reduce(
        (sum, load) => sum + load.rateAmount,
        0
      );
      const completedCount = (data.loads || []).filter(
        (l) => l.status === 'completed'
      ).length;

      setStats({
        totalLoads: data.loads?.length || 0,
        completedLoads: completedCount,
        totalRevenue,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load loads');
      console.error('Load loads error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanRateConfirmation = () => {
    Alert.alert(
      'Scan Rate Confirmation',
      'Redirecting to Smart Scan...'
    );
  };

  const handleCreateLoad = () => {
    Alert.alert('Create Load', 'Manual load form coming next');
  };

  const handleLoadPress = (loadId) => {
    Alert.alert('Load Details', `Load: ${loadId}\nDetails view coming next`);
  };

  const statusOptions = [
    { id: 'all', label: 'ALL' },
    { id: 'pending', label: 'PENDING' },
    { id: 'completed', label: 'COMPLETED' },
    { id: 'cancelled', label: 'CANCELLED' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Loads</Text>
        <Text style={styles.subtitle}>Scan and verify rate confirmations</Text>
      </View>

      {/* Stats */}
      <Section>
        <View style={styles.statsContainer}>
          <Card leftBorder={false} style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalLoads}</Text>
            <Text style={styles.statLabel}>Total Loads</Text>
          </Card>
          <Card leftBorder={false} style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedLoads}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card leftBorder={false} style={styles.statCard}>
            <Text style={styles.statRevenue}>
              ${stats.totalRevenue.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </Card>
        </View>
      </Section>

      {/* Status Filter */}
      <Section style={styles.filterSection}>
        <View style={styles.statusFilter}>
          {statusOptions.map((option) => (
            <Button
              key={option.id}
              label={option.label}
              variant={selectedStatus === option.id ? 'primary' : 'secondary'}
              size="small"
              onPress={() => setSelectedStatus(option.id)}
              style={styles.filterButton}
            />
          ))}
        </View>
      </Section>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : (
        <>
          {/* Loads List */}
          <View style={styles.loadsList}>
            {loads.length === 0 ? (
              <Text style={styles.noLoads}>No loads found</Text>
            ) : (
              loads.map((load) => (
                <TouchableOpacity
                  key={load.id}
                  style={styles.loadCard}
                  onPress={() => handleLoadPress(load.id)}
                >
                  <View style={styles.loadHeader}>
                    <Text style={styles.loadId}>{load.id}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: STATUS_COLORS[load.status],
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {STATUS_LABELS[load.status]}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.route}>
                    {load.startLocation} → {load.endLocation}
                  </Text>

                  <View style={styles.loadDetails}>
                    <Text style={styles.amount}>
                      ${load.rateAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.carrier}>{load.carrier}</Text>
                  </View>

                  <Text style={styles.dueDate}>
                    Due:{' '}
                    {new Date(load.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>

                  {load.rateConfirmationId && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>📄 Has rate confirmation</Text>
                    </View>
                  )}

                  {load.expenseIds && load.expenseIds.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        💰 {load.expenseIds.length} expense(s)
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </>
      )}

      {/* Action Buttons */}
      <Section style={styles.actionButtons}>
        <Button
          label="📸 SCAN RATE CONFIRMATION"
          onPress={handleScanRateConfirmation}
          size="large"
        />
        <Button
          label="+ CREATE LOAD"
          onPress={handleCreateLoad}
          size="large"
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    backgroundColor: theme.primary,
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primaryText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.primaryText,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 4,
  },
  statRevenue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.status.success,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.secondaryText,
  },
  statusFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.border.light,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
  },
  statusButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  statusButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.secondaryText,
  },
  statusButtonTextActive: {
    color: theme.primaryText,
  },
  loader: {
    marginTop: 40,
  },
  loadsList: {
    padding: 16,
  },
  noLoads: {
    color: theme.secondaryText,
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  loadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primaryText,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    color: theme.primaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  route: {
    fontSize: 14,
    color: theme.primaryText,
    marginBottom: 12,
  },
  loadDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.status.success,
  },
  carrier: {
    fontSize: 13,
    color: theme.secondaryText,
  },
  dueDate: {
    fontSize: 12,
    color: theme.secondaryText,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: theme.background.tertiary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    color: theme.primaryText,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: theme.status.warning,
  },
  createButton: {
    backgroundColor: theme.primary,
  },
  buttonText: {
    color: theme.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
});
