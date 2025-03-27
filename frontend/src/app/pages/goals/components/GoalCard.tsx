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

// A helper that returns time remaining if a valid targetDate exists.
const calculateTimeRemaining = (targetDate?: Date) => {
  if (!targetDate) {
    return { days: 0, isPastDue: false };
  }
  const now = new Date();
  const diffTime = new Date(targetDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { 
    days: diffDays,
    isPastDue: diffDays <= 0
  };
};

export default function GoalCard({ goal, onEdit, onDelete, onViewDetails, onAddMoney }: GoalCardProps) {
  const isSpendingLimit = goal.type === 'Spending Limit';

  // Calculate progress based on type:
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  let progress = 0;
  let progressText = "";
  let additionalInfo = null;
  let timeRemainingText = '';

  if (isSpendingLimit) {
    // For Spending Limit goals, use limitAmount as target.
    progress = calculateProgress(goal.currentAmount, goal.limitAmount);
    progressText = `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`;
    additionalInfo = (
      <>
        {goal.selectedAccount && <p>Account: {goal.selectedAccount}</p>}
        {goal.interval && <p>Interval: {goal.interval}</p>}
      </>
    );
    timeRemainingText = "N/A"; // No targetDate for Spending Limit goals
  } else {
    // For Savings goals, use targetAmount and compute time remaining
    progress = calculateProgress(goal.currentAmount, goal.targetAmount);
    progressText = `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`;

    if (goal.targetDate) {
      const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
      timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
    } else {
      timeRemainingText = "N/A";
    }

    additionalInfo = (
      <>
        <p>Category: {goal.category}</p>
        <p>{timeRemainingText}</p>
      </>
    );
  }

  const isCompleted = progress >= 100;

  return (
    <div className={`${styles.goalCard} ${isCompleted ? styles.completed : ''}`}>
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
        <p>{progressText}</p>
        {additionalInfo}
      </div>
    </div>
  );
}