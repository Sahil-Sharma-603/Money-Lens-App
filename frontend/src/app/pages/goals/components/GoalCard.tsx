'use client';
import React,{ useEffect, useState} from 'react';
import styles from '../goals.module.css';
import { Goal } from '../../../types/goals';
import { apiRequest } from '../../../assets/utilities/API_HANDLER';

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
  const isSavings = goal.type === 'Savings';
  const isCompleted = goal.currentAmount >= goal.targetAmount;
  const [progress, setProgress] = React.useState(0);
  const [progressText, setProgressText] = React.useState("");
  const [additionalInfo, setAdditionalInfo] = React.useState<React.ReactNode>(null);
  const [timeRemainingText, setTimeRemainingText] = React.useState('');
  const [accounts, setAccounts] = React.useState([]);

  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [forceRender, setForceRender] = useState(false);

  const toggleExpand = (goalId: string) => {
    setExpandedGoalId((prev) => (prev === goalId ? null : goalId));
    setForceRender((prev) => !prev); // Forces a re-render
  };

  // const toggleExpand = (goalId: string) => {
  //   console.log("Current Expanded Goal ID:", expandedGoalId); // Check previous state
  //   setExpandedGoalId((prev) => {
  //     const newState = prev === goalId ? null : goalId;
  //     console.log("New Expanded Goal ID:", newState); // Check new state
  //     return newState;
  //   });
  // };
  

  useEffect(() => {
      const fetchAccounts = async () => {
        try {
          
          const data = await apiRequest('/accounts', { requireAuth: true });
      
          if (Array.isArray(data.accounts)) {
            setAccounts(data.accounts);
            // Set default selected account if necessary, e.g., first account:
            
          } else {
            console.error('Unexpected response format:', data);
            setAccounts([]);
          }
        } catch (error) {
          console.error('Error fetching accounts:', error);
          setAccounts([]);
        }
      };
        
      fetchAccounts();
      
    }, []); 




  const spendingView = (goal: Goal) => {
    let account = accounts.find((account) => account._id === goal.selectedAccount);

    if (!account) {
      account = { _id: goal.selectedAccount, name: goal.selectedAccount }; // Fallback if not found
    } else if( !goal.selectedAccount) {
      account = { _id: 0, name: "N/A" }; // Fallback if not found
    }

    let timeRemainingText; 
    if(goal.interval === 'Date') {
      const { days, isPastDue } =  calculateTimeRemaining(new Date(goal.targetDate));
      timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
    } 

    return (
      <>
        {account.name && <p>Account: {account.name}</p>}
        <p>Category: {goal.category}</p>
        {goal.interval === "Date" ? (
        <p> {timeRemainingText}</p> // Format the date as needed
      ) : (
        <p>Interval: {goal.interval}</p>
      )}
      </>
    ); 

  }
  const savingsView = (goal: Goal) => { 
    const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
    const timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
  
    let account = accounts.find((account) => account._id === goal.selectedAccount) || 
                  { _id: goal.selectedAccount, name: goal.selectedAccount || "N/A" };
  
    const isExpanded = expandedGoalId === goal._id;
  
    return (
      <div>
        <p>Account: {account.name}</p>
        <p>{timeRemainingText}</p>
  
        {goal.subGoals && goal.subGoals.length > 0 && (
          <div>
            <button 
              className={styles.expandButton} 
              onClick={() => toggleExpand(goal._id)}
            >
              {isExpanded ? 'Hide Sub-goals ▲' : 'Show Sub-goals ▼'}
            </button>
  
            {isExpanded && (
              <div className={styles.goalCardSubGoals}>
                {goal.subGoals.map((subGoal) => (
                  <div key={subGoal._id} className={styles.goalCardSubGoals}>
                    <div className={styles.subGoalItem}><p >Sub-goal: {subGoal.name}</p></div>
                    <div className={styles.subGoalItem}><p >${subGoal.currentAmount.toLocaleString()} / ${subGoal.goalAmount.toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  

  const fillGoalCard = (goal: Goal) => {
    if (isSpendingLimit) {
      setProgress(calculateProgress(goal.currentAmount, goal.limitAmount));
      setProgressText(`Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`);
      // setAdditionalInfo(spendingView(goal));
      if (goal.interval === 'Date') {
        const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
        setTimeRemainingText(isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`);
      } else {
        setTimeRemainingText("N/A"); // No targetDate for Spending Limit goals
      }
      
    } else if (isSavings) {
      setProgress(calculateProgress(goal.currentAmount, goal.targetAmount));  
      setProgressText(`Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`);
      // setAdditionalInfo(savingsView(goal, expandedGoalId === goal._id, () => toggleExpand(goal._id)));
    // );
      if (goal.targetDate) {
        const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
        setTimeRemainingText(isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`);
      }
      else {
        setTimeRemainingText("N/A");
      }  

    }
    setAdditionalInfo(isSavings ? savingsView(goal) : spendingView(goal));

    const isCompleted = progress >= 100;
  }

  useEffect(() => {
    fillGoalCard(goal);
  }, [accounts]); // This will run whenever `goal` changes

  // Calculate progress based on type:
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };


    

  return (
    <div className={`${styles.goalCard} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.goalHeader}>
        <h2>{isSpendingLimit ? 'Spending Limit' : 'Savings Goal'}</h2>
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
        {isSavings ? savingsView(goal) : spendingView(goal)}
        {/* {isSpendingLimit && spendingView(goal)} */}
        {/* {additionalInfo} */}
      </div>
    </div>
  );
}