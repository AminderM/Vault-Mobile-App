import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExpenses } from '../lib/api';
import { DARK_THEME as T, BRAND, TYPOGRAPHY, SPACING } from '../lib/theme';

const TIME_PERIODS = [
  { id: 'week', label: 'THIS WEEK' },
  { id: 'month', label: 'THIS MONTH' },
  { id: 'year', label: 'THIS YEAR' },
  { id: 'all', label: 'ALL TIME' },
];

const RECENT_EXPENSES = [
  { id: '1', description: 'Fuel Stop - Pilot #452', date: 'Sept 22, 2024 • 14:32', amount: -542.10, category: 'Fuel & DEF' },
  { id: '2', description: 'Tire Replacement (Front Left)', date: 'Sept 20, 2024 • 09:15', amount: -1280.00, category: 'Maintenance' },
  { id: '3', description: 'PA Turnpike Tolls', date: 'Sept 19, 2024 • 18:00', amount: -84.50, category: 'Tolls' },
];

const CHART_DATA = [
  { month: 'APR', revenue: 60, expense: 40 },
  { month: 'MAY', revenue: 75, expense: 45 },
  { month: 'JUN', revenue: 65, expense: 55 },
  { month: 'JUL', revenue: 85, expense: 50 },
  { month: 'AUG', revenue: 70, expense: 42 },
  { month: 'SEP', revenue: 95, expense: 48 },
];

function MetricCard({ label, value, change, borderColor, valueColor }) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: borderColor }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: valueColor || T.text.primary }]}>{value}</Text>
      {change ? (
        <Text style={[styles.metricChange, { color: valueColor || T.text.secondary }]}>{change}</Text>
      ) : null}
    </View>
  );
}

function BarChart({ data }) {
  return (
    <View>
      <Text style={styles.chartTitle}>Revenue vs Expenses</Text>
      <Text style={styles.chartSubtitle}>Last 6 Months Trend</Text>
      <View style={styles.barChart}>
        {data.map((d) => (
          <View key={d.month} style={styles.barGroup}>
            <View style={styles.barPair}>
              <View style={[styles.bar, { height: `${d.revenue}%`, backgroundColor: BRAND.profitGreen }]} />
              <View style={[styles.bar, { height: `${d.expense}%`, backgroundColor: T.primary }]} />
            </View>
            <Text style={styles.barLabel}>{d.month}</Text>
          </View>
        ))}
      </View>
      {/* Legend */}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: BRAND.profitGreen }]} />
          <Text style={styles.legendText}>Revenue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: T.primary }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
    </View>
  );
}

function ExpenseRow({ expense }) {
  return (
    <View style={styles.expenseRow}>
      <View style={styles.expenseIcon}>
        <Text style={{ fontSize: 20 }}>🧾</Text>
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDesc}>{expense.description}</Text>
        <Text style={styles.expenseDate}>{expense.date}</Text>
      </View>
      <View style={styles.expenseAmountCol}>
        <Text style={styles.expenseAmount}>{expense.amount.toFixed(2)}</Text>
        <Text style={styles.expenseCategory}>{expense.category}</Text>
      </View>
    </View>
  );
}

export default function ExpenseScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [expenses, setExpenses] = useState(RECENT_EXPENSES);
  const [loading, setLoading] = useState(false);
  const [totals] = useState({
    collected: '$142,500',
    expenses: '$84,320',
    invoiced: '$58,180',
    outstanding: '$12,450',
  });

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const filters = {};
        if (selectedPeriod === 'week') {
          filters.startDate = new Date(now - 7 * 86400000).toISOString();
        } else if (selectedPeriod === 'month') {
          filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        } else if (selectedPeriod === 'year') {
          filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
        }
        const data = await getExpenses(filters);
        if (data.expenses && data.expenses.length > 0) {
          setExpenses(data.expenses.map((e) => ({
            id: e.id,
            description: e.description || 'Expense',
            date: new Date(e.date).toLocaleDateString(),
            amount: -Math.abs(e.amount),
            category: e.category || 'Other',
          })));
        } else {
          setExpenses(RECENT_EXPENSES);
        }
      } catch {
        setExpenses(RECENT_EXPENSES);
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, [selectedPeriod]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>📊  P&L View</Text>
          <View style={styles.periodBadge}>
            <Text style={styles.periodBadgeText}>Q3 FISCAL 2024</Text>
          </View>
        </View>

        {/* Summary metric cards 2x2 */}
        <View style={styles.metricGrid}>
          <MetricCard label="COLLECTED" value={totals.collected} change="↑ +12.4%" borderColor={BRAND.profitGreen} valueColor={BRAND.profitGreen} />
          <MetricCard label="EXPENSES" value={totals.expenses} change="↓ -2.1%" borderColor={T.primary} valueColor={T.primary} />
          <MetricCard label="INVOICED" value={totals.invoiced} change="Pending processing" borderColor={BRAND.vaultBlue} valueColor={T.secondary} />
          <MetricCard label="OUTSTANDING" value={totals.outstanding} change="4 Overdue Loads" borderColor={BRAND.hazardOrange} valueColor={BRAND.hazardOrange} />
        </View>

        {/* Time period tabs */}
        <View style={styles.periodTabs}>
          {TIME_PERIODS.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.periodTab, selectedPeriod === p.id && styles.periodTabActive]}
              onPress={() => setSelectedPeriod(p.id)}
              accessibilityRole="tab"
              accessibilityLabel={p.label}
            >
              <Text style={[styles.periodTabText, selectedPeriod === p.id && styles.periodTabTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <BarChart data={CHART_DATA} />
        </View>

        {/* Recent Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="View all expenses">
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.expenseList}>
            {expenses.map((e) => <ExpenseRow key={e.id} expense={e} />)}
          </View>
        )}

        {/* Download button */}
        <Pressable
          style={({ pressed }) => [styles.downloadBtn, pressed && { opacity: 0.8 }]}
          onPress={() => Alert.alert('Download', 'P&L Report download coming soon!')}
          accessibilityRole="button"
          accessibilityLabel="Download P&L Report"
        >
          <Text style={styles.downloadBtnText}>⬇  DOWNLOAD P&L REPORT</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.background.base },
  container: { flex: 1, backgroundColor: T.background.base, paddingBottom: 100 },

  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.stackMd,
    paddingBottom: SPACING.stackSm,
  },
  pageTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, fontSize: 20 },
  periodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border.variant,
    backgroundColor: T.background.container,
  },
  periodBadgeText: { ...TYPOGRAPHY.labelData, color: T.text.secondary },

  // Metric grid
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.stackSm,
    marginBottom: SPACING.stackMd,
  },
  metricCard: {
    width: '47.5%',
    backgroundColor: T.background.card,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderLeftWidth: 4,
    padding: SPACING.stackMd,
    gap: 4,
  },
  metricLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, letterSpacing: 0.5 },
  metricValue: { ...TYPOGRAPHY.displayMetricsMobile, fontSize: 22, fontWeight: '700' },
  metricChange: { ...TYPOGRAPHY.labelData, fontSize: 10 },

  // Period tabs
  periodTabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.stackSm,
    marginBottom: SPACING.stackMd,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: T.background.containerHighest,
  },
  periodTabActive: { backgroundColor: T.primary, borderColor: T.primary },
  periodTabText: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 9 },
  periodTabTextActive: { color: '#ffffff' },

  // Chart card
  chartCard: {
    marginHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.stackMd,
    backgroundColor: T.background.card,
    borderWidth: 1,
    borderColor: T.border.variant,
    borderRadius: 8,
    padding: SPACING.stackMd,
  },
  chartTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary, marginBottom: 2 },
  chartSubtitle: { ...TYPOGRAPHY.labelData, color: T.text.secondary, marginBottom: SPACING.stackMd },
  barChart: {
    flexDirection: 'row',
    height: 140,
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 4,
  },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barPair: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: '100%' },
  bar: { flex: 1, borderRadius: 2 },
  barLabel: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10 },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: SPACING.stackMd,
    paddingTop: SPACING.stackMd,
    borderTopWidth: 1,
    borderTopColor: T.border.variant,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...TYPOGRAPHY.labelData, color: T.text.secondary },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.stackSm,
  },
  sectionTitle: { ...TYPOGRAPHY.headlineSm, color: T.text.primary },
  viewAllText: { ...TYPOGRAPHY.labelData, color: T.secondary },

  // Expense list
  expenseList: { paddingHorizontal: SPACING.marginMobile, gap: 4, marginBottom: SPACING.stackLg },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.stackMd,
    backgroundColor: T.background.card,
    borderWidth: 1,
    borderColor: T.border.variant,
    paddingHorizontal: SPACING.stackMd,
    height: 72,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: T.background.containerHighest,
    borderWidth: 1,
    borderColor: T.border.variant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfo: { flex: 1 },
  expenseDesc: { ...TYPOGRAPHY.bodyMd, color: T.text.primary, fontWeight: '600' },
  expenseDate: { ...TYPOGRAPHY.labelData, color: T.text.secondary, marginTop: 2 },
  expenseAmountCol: { alignItems: 'flex-end' },
  expenseAmount: { ...TYPOGRAPHY.labelData, color: T.primary },
  expenseCategory: { ...TYPOGRAPHY.labelData, color: T.text.secondary, fontSize: 10, textTransform: 'uppercase', marginTop: 2 },

  // Download button
  downloadBtn: {
    marginHorizontal: SPACING.marginMobile,
    marginBottom: 100,
    height: 56,
    backgroundColor: T.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: { ...TYPOGRAPHY.headlineSm, color: '#ffffff', letterSpacing: 1.5, fontSize: 14 },
});
