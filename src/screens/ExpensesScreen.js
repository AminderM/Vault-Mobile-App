import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { getExpenses, createExpense } from '../lib/api';
import { BRAND, TYPOGRAPHY, SPACING, GlassCard, StatusBorderCard, useTheme, createThemedStyleSheet } from '../lib/theme';

const TIME_FILTERS = [
  { id: 'all', label: 'ALL TIME' },
  { id: 'week', label: 'THIS WEEK' },
  { id: 'month', label: 'THIS MONTH' },
  { id: 'year', label: 'THIS YEAR' },
];

const CATEGORIES = [
  { id: 'all', label: 'ALL', emoji: '📁' },
  { id: 'tolls', label: 'TOLLS', emoji: '🛣️' },
  { id: 'fuel', label: 'FUEL', emoji: '⛽' },
  { id: 'maintenance', label: 'MAINTENANCE', emoji: '🔧' },
  { id: 'meals', label: 'MEALS', emoji: '🍽️' },
  { id: 'lodging', label: 'LODGING', emoji: '🏨' },
  { id: 'other', label: 'OTHER', emoji: '🧾' },
];

export default function ExpensesScreen({ onBack, onNavigateToScan }) {
  const { mode: themeMode, t: T } = useTheme();
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Manual Add Expense Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [expDescription, setExpDescription] = useState('');
  const [expCategory, setExpCategory] = useState('tolls');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadExpensesData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const filters = {};
      
      if (selectedTimeFilter === 'week') {
        filters.startDate = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      } else if (selectedTimeFilter === 'month') {
        filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      } else if (selectedTimeFilter === 'year') {
        filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      }

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const data = await getExpenses(filters);
      setExpenses(data);
    } catch (err) {
      console.warn('Failed to load expenses from API, using empty list', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExpensesData();
  }, [selectedTimeFilter, selectedCategory]);

  const handleAddExpense = async () => {
    if (!expDescription || !expAmount) {
      Alert.alert('Required Fields', 'Please fill in description and amount.');
      return;
    }

    try {
      setIsAdding(true);
      const newExpense = {
        description: expDescription,
        category: expCategory,
        amount: parseFloat(expAmount),
        vendor: expVendor || undefined,
        date: new Date().toISOString().split('T')[0],
      };

      await createExpense(newExpense);
      Alert.alert('Success', 'Expense logged successfully!');
      setAddModalVisible(false);
      // Reset form
      setExpDescription('');
      setExpCategory('tolls');
      setExpAmount('');
      setExpVendor('');
      loadExpensesData();
    } catch (err) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Compute stats
  const totalSpent = expenses.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const categoryTotals = expenses.reduce((acc, item) => {
    const cat = item.category?.toLowerCase() || 'other';
    acc[cat] = (acc[cat] || 0) + Math.abs(item.amount);
    return acc;
  }, {});

  const getCategoryEmoji = (category) => {
    const cat = CATEGORIES.find(c => c.id === category?.toLowerCase());
    return cat ? cat.emoji : '🧾';
  };

  const getCategoryLabel = (category) => {
    const cat = CATEGORIES.find(c => c.id === category?.toLowerCase());
    return cat ? cat.label : (category || 'OTHER');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Pressable 
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to P&L"
          >
            <Text style={styles.headerIconText}>← P&L</Text>
          </Pressable>
          <Text style={styles.headerTitle}>EXPENSES</Text>
        </View>

        {/* Scan & Add Buttons */}
        <View style={styles.headerRightActions}>
          <Pressable
            style={({ pressed }) => [styles.scanBtn, pressed && styles.pressed]}
            onPress={onNavigateToScan}
            accessibilityRole="button"
            accessibilityLabel="Scan receipt"
          >
            <Text style={styles.scanBtnText}>✨ SCAN</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => setAddModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Add expense manually"
          >
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Time Filter Row */}
        <View style={styles.filterTabs}>
          {TIME_FILTERS.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.filterTab, selectedTimeFilter === f.id && styles.filterTabActive]}
              onPress={() => setSelectedTimeFilter(f.id)}
              accessibilityRole="tab"
              accessibilityLabel={f.label}
            >
              <Text style={[styles.filterTabText, selectedTimeFilter === f.id && styles.filterTabTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Total Spent Card */}
        <GlassCard style={styles.spentCard}>
          <View style={styles.spentHeader}>
            <Text style={styles.spentLabel}>TOTAL SPENT</Text>
            <Text style={styles.spentValue}>${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          
          {/* Progress Bars for Categories */}
          <View style={styles.progressSection}>
            {Object.keys(categoryTotals).map((catKey) => {
              const amount = categoryTotals[catKey];
              const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              const emoji = getCategoryEmoji(catKey);
              return (
                <View key={catKey} style={styles.progressRow}>
                  <Text style={styles.progressIcon}>{emoji}</Text>
                  <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBar, { width: `${Math.max(5, percentage)}%` }]} />
                  </View>
                  <Text style={styles.progressAmount}>${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>
              );
            })}
            {Object.keys(categoryTotals).length === 0 && (
              <Text style={styles.emptyProgressText}>No expenses in this period.</Text>
            )}
          </View>
        </GlassCard>

        {/* Horizontal Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catScrollContent}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat.id)}
              accessibilityRole="tab"
              accessibilityLabel={cat.label}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, selectedCategory === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Expense List */}
        {loading ? (
          <ActivityIndicator size="large" color={T.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.expenseList}>
            {expenses.map((item) => (
              <GlassCard key={item.id} style={styles.expenseRow}>
                <View style={styles.expenseIconBox}>
                  <Text style={{ fontSize: 22 }}>{getCategoryEmoji(item.category)}</Text>
                </View>
                <View style={styles.expenseMainInfo}>
                  <Text style={styles.expenseDescText}>{item.description}</Text>
                  <Text style={styles.expenseDateText}>
                    {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    {item.vendor ? ` • ${item.vendor}` : ''}
                  </Text>
                </View>
                <View style={styles.expenseRightCol}>
                  <Text style={styles.expenseAmountText}>-${Math.abs(item.amount).toFixed(2)}</Text>
                  <Text style={styles.expenseCategoryText}>{getCategoryLabel(item.category)}</Text>
                </View>
              </GlassCard>
            ))}

            {!loading && expenses.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses logged matching criteria</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Manual Add Expense Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADD NEW EXPENSE</Text>
              <Pressable onPress={() => setAddModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={{ fontSize: 18, color: T.text.primary }}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16 }}>
              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>DESCRIPTION</Text>
                <TextInput
                  style={styles.modalInput}
                  value={expDescription}
                  onChangeText={setExpDescription}
                  placeholder="e.g. Fuel Stop - Pilot"
                  placeholderTextColor={T.text.muted}
                />
              </View>

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>AMOUNT ($)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={expAmount}
                  onChangeText={setExpAmount}
                  placeholder="e.g. 150.00"
                  placeholderTextColor={T.text.muted}
                  keyboardType="numeric"
                />
              </View>

              {/* Vendor */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>VENDOR (OPTIONAL)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={expVendor}
                  onChangeText={setExpVendor}
                  placeholder="e.g. Pilot Flying J"
                  placeholderTextColor={T.text.muted}
                />
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CATEGORY</Text>
                <View style={styles.pickerWrapper}>
                  {CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                    <Pressable
                      key={c.id}
                      style={[styles.pickerCatItem, expCategory === c.id && styles.pickerCatItemActive]}
                      onPress={() => setExpCategory(c.id)}
                    >
                      <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                      <Text style={[styles.pickerCatLabel, expCategory === c.id && styles.pickerCatLabelActive]}>
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.8 }]}
                onPress={handleAddExpense}
                disabled={isAdding}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>✓ SAVE EXPENSE</Text>
                )}
              </Pressable>
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = createThemedStyleSheet((T) => {
  const isLight = T.background.base === '#edeef3';
  const cardBg = isLight ? 'rgba(190, 195, 210, 0.85)' : 'rgba(13, 4, 4, 0.85)';

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    topHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    headerIconText: {
      fontSize: 13,
      fontWeight: '700',
      color: T.text.primary,
    },
    headerTitle: {
      ...TYPOGRAPHY.headlineSm,
      color: T.text.primary,
      fontWeight: '700',
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    scanBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 4,
      backgroundColor: isLight ? 'rgba(255, 120, 120, 0.25)' : 'rgba(120, 20, 20, 0.25)',
      borderWidth: 1,
      borderColor: BRAND.crimsonRedLight + '4D',
    },
    scanBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: T.primary,
      letterSpacing: 0.5,
    },
    addBtn: {
      width: 34,
      height: 34,
      borderRadius: 4,
      backgroundColor: BRAND.crimsonRed,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addBtnText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
    },
    pressed: { opacity: 0.75 },

    // Filter Tabs
    filterTabs: {
      flexDirection: 'row',
      paddingHorizontal: SPACING.marginMobile,
      paddingTop: SPACING.stackMd,
      gap: 6,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 4,
      alignItems: 'center',
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    filterTabActive: {
      backgroundColor: BRAND.crimsonRed,
      borderColor: BRAND.crimsonRed,
    },
    filterTabText: {
      ...TYPOGRAPHY.labelData,
      fontSize: 10,
      color: T.text.secondary,
    },
    filterTabTextActive: {
      color: '#ffffff',
      fontWeight: '700',
    },

    // Total Spent Card
    spentCard: {
      marginHorizontal: SPACING.marginMobile,
      marginTop: SPACING.stackMd,
      padding: SPACING.stackMd,
      backgroundColor: cardBg,
    },
    spentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
      paddingBottom: 10,
      marginBottom: 10,
    },
    spentLabel: {
      ...TYPOGRAPHY.labelData,
      color: T.text.secondary,
    },
    spentValue: {
      ...TYPOGRAPHY.displayMetricsMobile,
      fontSize: 26,
      fontWeight: '800',
      color: T.primary,
    },
    progressSection: {
      gap: 12,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    progressIcon: {
      fontSize: 16,
    },
    progressBarWrapper: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.background.containerHighest,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: BRAND.crimsonRed,
      borderRadius: 4,
    },
    progressAmount: {
      ...TYPOGRAPHY.labelData,
      color: T.text.primary,
      width: 70,
      textAlign: 'right',
    },
    emptyProgressText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.secondary,
      textAlign: 'center',
      paddingVertical: 12,
    },

    // Categories
    catScroll: {
      marginTop: SPACING.stackMd,
      paddingLeft: SPACING.marginMobile,
      maxHeight: 45,
    },
    catScrollContent: {
      gap: 8,
      paddingRight: 32,
    },
    catPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 4,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    catPillActive: {
      backgroundColor: BRAND.crimsonRed,
      borderColor: BRAND.crimsonRed,
    },
    catEmoji: {
      fontSize: 14,
    },
    catLabel: {
      ...TYPOGRAPHY.labelData,
      fontSize: 10,
      color: T.text.secondary,
    },
    catLabelActive: {
      color: '#ffffff',
      fontWeight: '700',
    },

    // List
    expenseList: {
      paddingHorizontal: SPACING.marginMobile,
      marginTop: SPACING.stackMd,
      gap: 8,
    },
    expenseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.stackMd,
      paddingHorizontal: SPACING.stackMd,
      height: 72,
      backgroundColor: cardBg,
    },
    expenseIconBox: {
      width: 44,
      height: 44,
      borderRadius: 4,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    expenseMainInfo: {
      flex: 1,
    },
    expenseDescText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.primary,
      fontWeight: '600',
    },
    expenseDateText: {
      ...TYPOGRAPHY.labelData,
      color: T.text.secondary,
      fontSize: 10,
      marginTop: 2,
    },
    expenseRightCol: {
      alignItems: 'flex-end',
    },
    expenseAmountText: {
      ...TYPOGRAPHY.labelData,
      color: T.primary,
      fontWeight: '700',
    },
    expenseCategoryText: {
      ...TYPOGRAPHY.labelData,
      color: T.text.secondary,
      fontSize: 9,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      ...TYPOGRAPHY.bodyMd,
      color: T.text.secondary,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxHeight: '85%',
      backgroundColor: T.background.base === '#edeef3' ? '#ffffff' : '#1e1b1b',
      borderWidth: 1.5,
      borderColor: BRAND.crimsonRed,
      padding: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1.5,
      borderBottomColor: T.border.variant,
      paddingBottom: 10,
      marginBottom: 16,
    },
    modalTitle: {
      ...TYPOGRAPHY.headlineSm,
      color: T.primary,
      letterSpacing: 1,
    },
    modalCloseBtn: {
      padding: 4,
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      ...TYPOGRAPHY.labelData,
      color: T.text.secondary,
      fontSize: 10,
    },
    modalInput: {
      height: 48,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: T.border.variant,
      paddingHorizontal: 12,
      fontSize: 14,
      color: T.text.primary,
      backgroundColor: T.background.container,
    },
    pickerWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    pickerCatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 4,
      backgroundColor: T.background.containerHighest,
      borderWidth: 1,
      borderColor: T.border.variant,
    },
    pickerCatItemActive: {
      backgroundColor: BRAND.crimsonRed,
      borderColor: BRAND.crimsonRed,
    },
    pickerCatLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: T.text.secondary,
    },
    pickerCatLabelActive: {
      color: '#ffffff',
    },
    submitBtn: {
      height: 52,
      backgroundColor: T.primary,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    submitBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: 0.5,
    },
  });
});
