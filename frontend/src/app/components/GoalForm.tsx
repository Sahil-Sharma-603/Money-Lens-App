import React, { useState } from 'react';
import styles from '../assets/styles/goals.module.css';
import { Goal, GoalType, SpendingPeriod } from '../types/goals';

interface GoalFormProps {
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id'>) => void;
  initialGoal?: Goal;
}

export default function GoalForm({ onClose, onSubmit, initialGoal }: GoalFormProps) {
  const [formData, setFormData] = useState({
    name: initialGoal?.name || '',
    targetAmount: initialGoal?.targetAmount || 0,
    currentAmount: initialGoal?.currentAmount || 0,
    targetDate: initialGoal?.targetDate || new Date(),
    category: (initialGoal?.category as GoalType) || 'Savings',
    type: (initialGoal?.type as GoalType) || 'Savings',
    spendingPeriod: initialGoal?.spendingPeriod || 'Monthly',
    limitCategory: initialGoal?.limitCategory || '',
    description: initialGoal?.description || ''
  });

  const isSpendingLimit = formData.type === 'Spending Limit';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{initialGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}>
          <div className={styles.formGroup}>
            <label>Goal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as GoalType})}
            >
              <option value="Savings">Savings</option>
              <option value="Spending Limit">Spending Limit</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Goal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {isSpendingLimit && (
            <div className={styles.formGroup}>
              <label>Spending Limit Period</label>
              <select
                value={formData.spendingPeriod}
                onChange={(e) => setFormData({...formData, spendingPeriod: e.target.value as SpendingPeriod})}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Category">Category-specific</option>
              </select>
            </div>
          )}

          {isSpendingLimit && formData.spendingPeriod === 'Category' && (
            <div className={styles.formGroup}>
              <label>Spending Category</label>
              <input
                type="text"
                value={formData.limitCategory}
                onChange={(e) => setFormData({...formData, limitCategory: e.target.value})}
                required
                placeholder="e.g., Entertainment, Food, Shopping"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{isSpendingLimit ? 'Spending Limit' : 'Target Amount'}</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>{isSpendingLimit ? 'Current Spending' : 'Current Amount'}</label>
            <input
              type="number"
              value={formData.currentAmount}
              onChange={(e) => setFormData({...formData, currentAmount: Number(e.target.value)})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Target Date</label>
            <input
              type="date"
              value={formData.targetDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, targetDate: new Date(e.target.value)})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}