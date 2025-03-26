import React from 'react';
import styles from '../goals.module.css';
import { Goal } from '../../../types/goals';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onAddMoney: (goal: Goal) => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onViewDetails, onAddMoney }: GoalCardProps) {
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateTimeRemaining = (targetDate: Date) => {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { 
      days: diffDays,
      isPastDue: diffDays <= 0
    };
  };

  const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
  const { days, isPastDue } = calculateTimeRemaining(goal.targetDate);
  const timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
  
  const isSpendingLimit = goal.type === 'Spending Limit';
  const isCompleted = isSpendingLimit ? progress >= 100 : progress >= 100;
  const shouldHighlightPastDue = isPastDue && !isCompleted;

  return (
    <div className={`${styles.goalCard} ${shouldHighlightPastDue ? styles.pastDue : ''}`}>
      <div className={styles.goalHeader}>
        <h3>{goal.title}</h3>
        <div className={styles.actions}>
          <button onClick={onViewDetails}>Details</button>
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
        <button 
          onClick={() => onAddMoney(goal)}
          className={styles.addMoneyButton}
        >
          {isSpendingLimit ? 'Add Spending' : 'Add Money'}
        </button>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={`${styles.progressFill} ${isCompleted ? styles.completed : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.goalDetails}>
        <p>
          {isSpendingLimit 
            ? `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`
            : `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`
          }
        </p>
        {!isSpendingLimit && <p>Category: {goal.category}</p>}
        <p className={`${isPastDue ? styles.pastDueText : ''}`}>{timeRemainingText}</p>
      </div>
    </div>
  );
}