# Feature: Expense Records

**Status:** 🔄 In Progress  
**Priority:** 3  
**Effort:** 5-6 hours  
**Branch:** `feature/expense-records`

---

## What's This Feature?

Users can now **track and manage expenses separately** from the document vault.

Based on the PWA, Expense Records allow users to:
- 📝 Record expenses manually
- 📸 Scan receipts and auto-extract expense data
- 📊 View expense breakdown by category
- 📅 Filter by time period (All Time, This Week, This Month, This Year)
- 💰 See total spending and trends

---

## Design Reference (From PWA)

### Expenses Screen
```
EXPENSES (Header)

[ALL TIME] [THIS WEEK] [THIS MONTH] [THIS YEAR]

TOTAL SPENT: $150.00

📊 [Spending chart showing breakdown]

┌─────────────────────────────┐
│ 🛣️  Tolls                    │
│ Jun 1, 2026            -$150.00  │
└─────────────────────────────┘

[+ SCAN] [+ ADD EXPENSE]
```

### Key Features
- **Time-based filtering** (tabs at top)
- **Total spent display** (prominent)
- **Category breakdown** (with icons and amounts)
- **Expense list** (date, description, amount)
- **Action buttons** (Scan receipt, Add expense)
- **Category icons** (🛣️ Tolls, 🍔 Meals, ⛽ Fuel, etc.)

---

## Implementation Plan

### Step 1: Create Expense Data Model

Create `src/types/expense.ts`:

```typescript
export interface Expense {
  id: string;
  category: string;
  vendor?: string;
  description: string;
  amount: number;
  date: string; // ISO date
  receiptImage?: string; // URI to image
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = 
  | 'fuel'
  | 'tolls'
  | 'meals'
  | 'accommodation'
  | 'maintenance'
  | 'parking'
  | 'other';

export interface ExpenseStats {
  totalSpent: number;
  byCategory: Record<ExpenseCategory, number>;
  expenseCount: number;
}
```

### Step 2: Create Expense API Functions

Update `src/lib/api.js` with expense endpoints:

```javascript
export async function createExpense(expenseData) {
  const response = await fetch(
    `${getEnv().apiUrl}/api/driver-mobile/expenses`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create expense');
  }

  return await response.json();
}

export async function getExpenses(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.category) params.append('category', filters.category);

  const response = await fetch(
    `${getEnv().apiUrl}/api/driver-mobile/expenses?${params}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return await response.json();
}

export async function deleteExpense(expenseId) {
  const response = await fetch(
    `${getEnv().apiUrl}/api/driver-mobile/expenses/${expenseId}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }

  return await response.json();
}
```

### Step 3: Create ExpenseScreen Component

Create `src/screens/ExpenseScreen.js`:

```javascript
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
import { getExpenses, createExpense } from '../lib/api';

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
      // 'all' has no date filters
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
    Alert.alert('Scan Receipt', 'Coming in Phase 2B - Receipt OCR');
  };

  const handleAddExpense = () => {
    Alert.alert('Add Expense', 'Coming next - Manual expense form');
  };

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
          {Object.keys(getCategoryBreakdown()).length > 0 && (
            <View style={styles.breakdownSection}>
              {CATEGORIES.map((cat) => {
                const amount = getCategoryBreakdown()[cat.id] || 0;
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
            {expenses.length === 0 ? (
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
    backgroundColor: '#1a1a1a',
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
    borderColor: '#333',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  periodTabActive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  periodTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
  },
  periodTabTextActive: {
    color: '#fff',
  },
  totalSection: {
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  loader: {
    marginTop: 40,
  },
  breakdownSection: {
    backgroundColor: '#2a2a2a',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
  },
  categoryAmount: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  expenseList: {
    marginBottom: 20,
  },
  noExpenses: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseDate: {
    color: '#999',
    fontSize: 12,
  },
  expenseAmount: {
    color: '#FF3B30',
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
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  addButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

### Step 4: Integrate with App Tabs

Update `src/components/app-tabs.web.tsx` to show real ExpenseScreen:

Replace the `case 'expenses':` with:

```typescript
import ExpenseScreen from '@/screens/ExpenseScreen';

case 'expenses':
  return <ExpenseScreen />;
```

### Step 5: Test on Web

```bash
$env:REACT_APP_ENV='staging'; npm run web

# Then click "Expenses" tab
# Should see:
- Time period tabs (ALL TIME, THIS WEEK, THIS MONTH, THIS YEAR)
- Total spent display
- Empty state (no expenses yet)
- Action buttons (SCAN, ADD EXPENSE)
```

---

## Testing Checklist

### Web Testing
- [ ] Time period tabs work
- [ ] Total spent updates based on period
- [ ] Empty state displays
- [ ] Category breakdown shows (once expenses exist)
- [ ] Buttons trigger actions
- [ ] Styling matches PWA design

### Mobile Testing
- [ ] Layout responsive on different screen sizes
- [ ] Tabs are easy to tap
- [ ] Scrolling is smooth
- [ ] Expense list is readable

---

## What's Next

Once this is done:
1. ✅ Priority 3: Expense Records (foundation complete)
2. ⏳ Add manual expense form (Allow users to add expenses)
3. ⏳ Add receipt scanning to expenses
4. ⏳ Priority 4: Load Management (5-6 hours)
5. ⏳ Priority 5: File Picker (3-4 hours)

---

## Files to Create/Modify

- `src/types/expense.ts` - NEW (TypeScript types)
- `src/screens/ExpenseScreen.js` - NEW (main component)
- `src/lib/api.js` - UPDATE (add expense endpoints)
- `src/components/app-tabs.web.tsx` - UPDATE (integrate screen)

---

## Commit Message

```
feat: Add expense records tracking

- Create ExpenseScreen component with time-based filtering
- Add expense API endpoints (create, get, delete)
- Display total spending and category breakdown
- Show expense list with dates and amounts
- Implement time period tabs (All Time, Week, Month, Year)
- Design follows PWA specifications

Phase 2A Priority 3 feature foundation complete.
Users can now track expenses separately from documents.
```
