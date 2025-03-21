export type GoalType = 'Savings' | 'Spending Limit';
export type SpendingPeriod = 'Monthly' | 'Weekly' | 'Yearly';

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category?: string;
  type: GoalType;
  spendingPeriod?: SpendingPeriod;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 