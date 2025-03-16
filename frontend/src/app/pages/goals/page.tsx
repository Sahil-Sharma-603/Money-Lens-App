'use client';

import React, { useState } from 'react';
import styles from '../../assets/styles/goals.module.css';
import pageStyles from '../../assets/page.module.css';
import GoalCard from '../../components/GoalCard';
import GoalForm from '../../components/GoalForm';
import { Goal } from '../../types/goals';
import GoalDetails from '../../components/GoalDetails';
import Card from '../../components/Card';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'progress' | 'amount'>('date');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateTimeRemaining = (targetDate: Date) => {
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : 'Past due';
  };

  return (
    <div className={pageStyles.dashboard}>
      <Card className={pageStyles.fullPageCard}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Financial Goals</h1>
            <button 
              className={styles.addButton}
              onClick={() => setIsAddingGoal(true)}
            >
              Add New Goal
            </button>
          </div>

          <div className={styles.controls}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.sortSelect}
            >
              <option value="date">Sort by Date</option>
              <option value="progress">Sort by Progress</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>

          <div className={styles.goalsGrid}>
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={() => {/* Handle edit */}} 
                onDelete={() => {
                  setGoals(goals.filter(g => g.id !== goal.id));
                }}
                onViewDetails={() => setSelectedGoal(goal)}
              />
            ))}
          </div>
        </div>
      </Card>

      {isAddingGoal && (
        <GoalForm 
          onClose={() => setIsAddingGoal(false)}
          onSubmit={(newGoal: Omit<Goal, 'id'>) => {
            setGoals([...goals, { ...newGoal, id: Date.now().toString() }]);
            setIsAddingGoal(false);
          }}
        />
      )}

      {selectedGoal && (
        <GoalDetails 
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </div>
  );
}