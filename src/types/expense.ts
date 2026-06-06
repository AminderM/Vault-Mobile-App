export interface Expense {
  id: string;
  category: string;
  vendor?: string;
  description: string;
  amount: number;
  date: string;
  receiptImage?: string;
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

export interface CreateExpenseInput {
  category: ExpenseCategory;
  vendor?: string;
  description: string;
  amount: number;
  date: string;
  receiptImage?: string;
  notes?: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  category?: ExpenseCategory;
}

export interface ExpenseResponse {
  expenses: Expense[];
  stats: ExpenseStats;
  total: number;
  page?: number;
  pageSize?: number;
}
