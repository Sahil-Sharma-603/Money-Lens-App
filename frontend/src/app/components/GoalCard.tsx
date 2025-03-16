import React from 'react';
import styles from '../assets/styles/goals.module.css';
import { Goal } from '../types/goals';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onViewDetails }: GoalCardProps) {
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateTimeRemaining = (targetDate: Date) => {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : 'Past due';
  };

  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const timeRemaining = calculateTimeRemaining(goal.targetDate);
  const isSpendingLimit = goal.type === 'Spending Limit';

  const getSpendingLimitTitle = () => {
    if (goal.spendingPeriod === 'Category') {
      return `${goal.limitCategory} Spending`;
    }
    return `${goal.spendingPeriod} Spending Limit`;
  };

  return (
    <div className={styles.goalCard}>
      <div className={styles.goalHeader}>
        <h3>{isSpendingLimit ? getSpendingLimitTitle() : goal.name}</h3>
        <div className={styles.actions}>
          <button onClick={onViewDetails}>View Details</button>
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={`${styles.progressFill} ${isSpendingLimit && progress > 100 ? styles.exceeded : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.goalDetails}>
        <p>
          {isSpendingLimit ? (
            `Spent: $${goal.currentAmount} / $${goal.targetAmount} Limit`
          ) : (
            `Progress: $${goal.currentAmount} / $${goal.targetAmount}`
          )}
        </p>
        <p>Type: {goal.type}</p>
        {isSpendingLimit && goal.spendingPeriod === 'Category' && (
          <p>Category: {goal.limitCategory}</p>
        )}
        <p>{timeRemaining}</p>
      </div>
    </div>
  );
}