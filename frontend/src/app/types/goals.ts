export type GoalType = 'Savings' | 'Spending Limit';
export type SpendingPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Category';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: GoalType;
  type: GoalType;
  spendingPeriod?: SpendingPeriod;
  limitCategory?: string;  // For category-specific spending limits
  description?: string;
} 