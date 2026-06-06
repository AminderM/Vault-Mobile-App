export interface Load {
  id: string;
  userId: string;
  startLocation: string;
  endLocation: string;
  date: string;
  rateAmount: number;
  carrier: string;
  status: 'pending' | 'completed' | 'cancelled';
  rateConfirmationId?: string;
  expenseIds: string[];
  notes?: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoadStatus = 'pending' | 'completed' | 'cancelled';

export interface LoadStats {
  totalLoads: number;
  completedLoads: number;
  totalRevenue: number;
  averageRate: number;
  totalMiles?: number;
}

export interface CreateLoadInput {
  startLocation: string;
  endLocation: string;
  date: string;
  rateAmount: number;
  carrier: string;
  notes?: string;
}

export interface LoadFilter {
  status?: LoadStatus;
  startDate?: string;
  endDate?: string;
  carrier?: string;
}
