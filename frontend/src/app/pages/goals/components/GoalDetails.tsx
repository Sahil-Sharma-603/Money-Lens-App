
import React from 'react';
import styles from '../goals.module.css';
import Card from '../../../components/Card';
import { Goal } from '../../../types/goals';

interface GoalDetailsProps {
  goal: Goal;
  onClose: () => void;
}

const getPeriodDays = (interval: string, targetDate?: Date) => {
  switch (interval) {
    case 'Daily':
      return 1;
    case 'Weekly':
      return 7;
    case 'Monthly':
      return 30;
    case 'Annually':
      return 365;
    case 'Date':
      if (targetDate) {
        const now = new Date();
        const diffTime = new Date(targetDate).getTime() - now.getTime();
        // Ensure at least one day remains to avoid division by zero
        return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
      }
      return 1;
    default:
      return 1;
  }
};

export default function GoalDetails({ goal, onClose }: GoalDetailsProps) {
  const isSpendingLimit = goal.type === 'Spending Limit';

  if (isSpendingLimit) {
    // For Spending Limit goals, calculate budgetRemaining and max daily spending.
    const budgetRemaining = goal.limitAmount - goal.currentAmount;
    const periodDays = getPeriodDays(goal.interval, goal.targetDate);
    const dailyRate = budgetRemaining / periodDays;
    const progressPercentage =
      goal.limitAmount > 0
        ? Math.min((goal.currentAmount / goal.limitAmount) * 100, 100)
        : 0;

    return (
      <div className={styles.modalOverlay}>
        <Card className={styles.detailsCard}>
          <div className={styles.detailsHeader}>
            <h2>{goal.title}</h2>
            <button onClick={onClose} className={styles.closeButton}>
              &times;
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsSection}>
              <h3>Spending Progress</h3>
              <div className={styles.progressBarContainer}>
                <div
                  className={`${styles.progressBarFill} ${
                    progressPercentage >= 100 ? styles.exceeded : ''
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className={styles.progressText}>
                Spent: ${goal.currentAmount.toLocaleString()} of $
                {goal.limitAmount.toLocaleString()} Limit
              </p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Budget Remaining</h3>
              <p className={styles.bigNumber}>
                ${budgetRemaining.toLocaleString()}
              </p>
              <p>Remaining Limit</p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Interval</h3>
              <p className={styles.bigNumber}>{goal.interval}</p>
              <p>Spending Interval</p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Max Daily Spending</h3>
              <p className={styles.bigNumber}>
                {goal.limitAmount > 0
                  ? `$${dailyRate.toFixed(2)}`
                  : 'N/A'}
              </p>
              <p>per day</p>
            </div>
          </div>
        </Card>
      </div>
    );
  } else {
    // For Savings goals:
    const progressPercentage =
      goal.targetAmount > 0
        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        : 0;

    let daysRemaining = 0;
    let dailyRate = 0;
    let timeRemainingText = 'N/A';

    if (goal.targetDate) {
      const now = new Date();
      const targetDate = new Date(goal.targetDate);
      const diffTime = targetDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      timeRemainingText =
        daysRemaining <= 0
          ? `${Math.abs(daysRemaining)} days overdue`
          : `${daysRemaining} days remaining`;

      const remainingAmount =
        goal.currentAmount >= goal.targetAmount
          ? 0
          : goal.targetAmount - goal.currentAmount;
      dailyRate = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;
    }

    return (
      <div className={styles.modalOverlay}>
        <Card className={styles.detailsCard}>
          <div className={styles.detailsHeader}>
            <h2>{goal.title}</h2>
            <button onClick={onClose} className={styles.closeButton}>
              &times;
            </button>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailsSection}>
              <h3>Savings Progress</h3>
              <div className={styles.progressBarContainer}>
                <div
                  className={`${styles.progressBarFill} ${
                    progressPercentage >= 100 ? styles.completed : ''
                  }`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className={styles.progressText}>
                Saved: ${goal.currentAmount.toLocaleString()} of $
                {goal.targetAmount.toLocaleString()} Goal
              </p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Time Remaining</h3>
              <p className={styles.bigNumber}>{daysRemaining}</p>
              <p>{timeRemainingText}</p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Daily Savings Needed</h3>
              <p className={styles.bigNumber}>${dailyRate.toFixed(2)}</p>
              <p>per day</p>
            </div>

            <div className={styles.detailsSection}>
              <h3>Amount Left to Save</h3>
              <p className={styles.bigNumber}>
                ${Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()}
              </p>
              <p>to reach goal</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}
