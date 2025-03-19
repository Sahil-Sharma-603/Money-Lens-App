import React, { useState } from 'react';
import styles from '../assets/styles/goals.module.css';

// Updated type to match API structure
interface GoalFormProps {
  onClose: () => void;
  onSubmit: (goal: {
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    category: string;
    type: 'Savings' | 'Spending Limit';
    spendingPeriod?: 'Monthly' | 'Weekly' | 'Yearly';
  }) => void;
  initialGoal?: {
    id: string;
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    category: string;
    type: 'Savings' | 'Spending Limit';
    spendingPeriod?: 'Monthly' | 'Weekly' | 'Yearly';
  };
}

export default function GoalForm({ onClose, onSubmit, initialGoal }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: initialGoal?.title || '',
    targetAmount: initialGoal?.targetAmount || 0,
    currentAmount: initialGoal?.currentAmount || 0,
    targetDate: initialGoal?.targetDate || new Date(),
    category: initialGoal?.category || 'Savings',
    description: initialGoal?.description || '',
    type: initialGoal?.type || 'Savings'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    
    if (formData.targetAmount <= 0) {
      alert('Target amount must be greater than 0');
      return;
    }
    
    // Log what we're submitting to verify
    console.log('Submitting goal data:', formData);
    
    // Submit the form data
    onSubmit(formData);
  };

  const isSpendingLimit = formData.type === 'Spending Limit';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{initialGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              placeholder="Enter goal title"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Goal Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as 'Savings' | 'Spending Limit'})}
              required
            >
              <option value="Savings">Savings Goal</option>
              <option value="Spending Limit">Spending Limit</option>
            </select>
          </div>

          {!isSpendingLimit && (
            <div className={styles.formGroup}>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="Savings">Savings</option>
                <option value="Investment">Investment</option>
                <option value="Emergency">Emergency Fund</option>
                <option value="Retirement">Retirement</option>
                <option value="Education">Education</option>
                <option value="Home">Home</option>
                <option value="Travel">Travel</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>{isSpendingLimit ? 'Spending Limit' : 'Target Amount'}</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({...formData, targetAmount: Number(e.target.value)})}
              required
              min="1"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>{isSpendingLimit ? 'Amount Spent' : 'Current Amount'}</label>
            <input
              type="number"
              value={formData.currentAmount}
              onChange={(e) => setFormData({...formData, currentAmount: Number(e.target.value)})}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Target Date</label>
            <input
              type="date"
              value={formData.targetDate instanceof Date ? formData.targetDate.toISOString().split('T')[0] : new Date(formData.targetDate).toISOString().split('T')[0]}
              onChange={(e) => setFormData({...formData, targetDate: new Date(e.target.value)})}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add details about your financial goal"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" className={styles.saveButton}>Save Goal</button>
          </div>
        </form>
      </div>
    </div>
  );
}