export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  type: 'Savings' | 'Spending Limit';
  spendingPeriod?: 'Monthly' | 'Weekly' | 'Yearly';
}; 