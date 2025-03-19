// frontend/src/app/components/GoalDetails.tsx
import React from 'react';
import styles from '../assets/styles/goals.module.css';
import Card from './Card';
import { Goal } from '../types/goals';

interface GoalDetailsProps {
  goal: Goal;
  onClose: () => void;
}

export default function GoalDetails({ goal, onClose }: GoalDetailsProps) {
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const isSpendingLimit = goal.type === 'Spending Limit';
  const isCompleted = progressPercentage >= 100;
  
  // If completed/exceeded, set remaining amount and daily rate to 0
  const remainingAmount = isCompleted ? 0 : goal.targetAmount - goal.currentAmount;
  const dailyRate = isCompleted ? 0 : (daysRemaining > 0 ? remainingAmount / daysRemaining : 0);

  return (
    <div className={styles.modalOverlay}>
      <Card className={styles.detailsCard}>
        <div className={styles.detailsHeader}>
          <h2>{goal.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailsSection}>
            <h3>{isSpendingLimit ? 'Spending Progress' : 'Savings Progress'}</h3>
            <div className={styles.progressBarContainer}>
              <div 
                className={`${styles.progressBarFill} ${isSpendingLimit && progressPercentage > 100 ? styles.exceeded : ''}`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className={styles.progressText}>
              {isSpendingLimit 
                ? `Spent $${goal.currentAmount.toLocaleString()} of $${goal.targetAmount.toLocaleString()} Limit`
                : `Saved $${goal.currentAmount.toLocaleString()} of $${goal.targetAmount.toLocaleString()} Goal`
              }
            </p>
          </div>

          <div className={styles.detailsSection}>
            <h3>Time Remaining</h3>
            <p className={styles.bigNumber}>{daysRemaining}</p>
            <p>days until {isSpendingLimit ? 'reset' : 'target'} date</p>
          </div>

          <div className={styles.detailsSection}>
            <h3>{isSpendingLimit ? 'Max Daily Spending' : 'Daily Savings Needed'}</h3>
            <p className={styles.bigNumber}>${dailyRate.toFixed(2)}</p>
            <p>per day {isSpendingLimit ? 'to stay under limit' : 'to reach goal'}</p>
          </div>

          <div className={styles.detailsSection}>
            <h3>{isSpendingLimit ? 'Budget Remaining' : 'Amount Left to Save'}</h3>
            <p className={styles.bigNumber}>${remainingAmount.toLocaleString()}</p>
            <p>{isSpendingLimit ? 'left to spend this period' : 'to reach goal'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}