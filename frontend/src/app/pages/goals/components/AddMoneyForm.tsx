import React, { useState } from 'react';
import styles from '../goals.module.css';
import Card from '../../../components/Card';
import { Goal } from '../../../assets/utilities/API_HANDLER';

interface AddMoneyFormProps {
  goal: Goal;
  onClose: () => void;
  onSubmit: (goalId: string, amount: number) => void;
}

export default function AddMoneyForm({ goal, onClose, onSubmit }: AddMoneyFormProps) {
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onSubmit(goal._id, numAmount);
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <Card className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>Add Money to {goal.name}</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.addMoneyForm}>
          <div className={styles.formGroup}>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
              pattern="[0-9]*\.?[0-9]*"
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Add Money
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
} 