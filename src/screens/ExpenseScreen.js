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
import { getExpenses } from '../lib/api';
import { colors } from '../lib/theme';

const theme = colors.dark;

const CATEGORIES = [
  { id: 'fuel', label: 'Fuel', icon: '⛽' },
  { id: 'tolls', label: 'Tolls', icon: '🛣️' },
  { id: 'meals', label: 'Meals', icon: '🍔' },
  { id: 'accommodation', label: 'Hotel', icon: '🏨' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const TIME_PERIODS = [
  { id: 'all', label: 'ALL TIME' },
  { id: 'week', label: 'THIS WEEK' },
  { id: 'month', label: 'THIS MONTH' },
  { id: 'year', label: 'THIS YEAR' },
];

export default function ExpenseScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, [selectedPeriod]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const filters = getDateFilters(selectedPeriod);
      const data = await getExpenses(filters);
      setExpenses(data.expenses || []);

      const total = (data.expenses || []).reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      setTotalSpent(total);
    } catch (error) {
      Alert.alert('Error', 'Failed to load expenses');
      console.error('Load expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilters = (period) => {
    const now = new Date();
    const filters = {};

    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filters.startDate = weekAgo.toISOString();
        filters.endDate = now.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        filters.startDate = monthAgo.toISOString();
        filters.endDate = now.toISOString();
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear(), 0, 1);
        filters.startDate = yearAgo.toISOString();
        filters.endDate = now.toISOString();
        break;
    }

    return filters;
  };

  const getCategoryBreakdown = () => {
    const breakdown = {};
    expenses.forEach((exp) => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    return breakdown;
  };

  const handleScanReceipt = () => {
    Alert.alert(
      'Scan Receipt',
      'Receipt OCR coming in Phase 2B'
    );
  };

  const handleAddExpense = () => {
    Alert.alert(
      'Add Expense',
      'Manual expense form coming next'
    );
  };

  const categoryBreakdown = getCategoryBreakdown();
  const hasExpenses = expenses.length > 0;

  return (
    <ScrollView style={styles.container}>
      {/* Time Period Tabs */}
      <View style={styles.periodTabs}>
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.periodTab,
              selectedPeriod === period.id && styles.periodTabActive,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text
              style={[
                styles.periodTabText,
                selectedPeriod === period.id && styles.periodTabTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total Spent */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>TOTAL SPENT</Text>
        <Text style={styles.totalAmount}>${totalSpent.toFixed(2)}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF3B30" style={styles.loader} />
      ) : (
        <>
          {/* Category Breakdown */}
          {hasExpenses && Object.keys(categoryBreakdown).length > 0 && (
            <View style={styles.breakdownSection}>
              {CATEGORIES.map((cat) => {
                const amount = categoryBreakdown[cat.id] || 0;
                if (amount === 0) return null;

                const percentage =
                  totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

                return (
                  <View key={cat.id} style={styles.categoryRow}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={styles.categoryName}>{cat.label}</Text>
                    </View>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryAmount}>
                      ${amount.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Expense List */}
          <View style={styles.expenseList}>
            {!hasExpenses ? (
              <Text style={styles.noExpenses}>No expenses recorded</Text>
            ) : (
              expenses.map((expense) => (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseCategory}>
                      {CATEGORIES.find((c) => c.id === expense.category)
                        ?.icon || '📝'}{' '}
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    -${expense.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.scanButton]}
          onPress={handleScanReceipt}
        >
          <Text style={styles.buttonText}>📸 SCAN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddExpense}
        >
          <Text style={styles.buttonText}>+ ADD EXPENSE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    padding: 16,
  },
  periodTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.border.light,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
  },
  periodTabActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.secondaryText,
  },
  periodTabTextActive: {
    color: theme.primaryText,
  },
  totalSection: {
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 12,
    color: theme.secondaryText,
    marginBottom: 8,
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.primary,
  },
  loader: {
    marginTop: 40,
  },
  breakdownSection: {
    backgroundColor: theme.background.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    color: theme.primaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBar: {
    height: 6,
    backgroundColor: theme.border.light,
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.primary,
  },
  categoryAmount: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  expenseList: {
    marginBottom: 20,
  },
  noExpenses: {
    color: theme.secondaryText,
    textAlign: 'center',
    paddingVertical: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: theme.background.secondary,
    borderRadius: 6,
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    color: theme.primaryText,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseDate: {
    color: theme.secondaryText,
    fontSize: 12,
  },
  expenseAmount: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    backgroundColor: theme.primary,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  addButton: {
    backgroundColor: theme.primary,
  },
  buttonText: {
    color: theme.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
});
