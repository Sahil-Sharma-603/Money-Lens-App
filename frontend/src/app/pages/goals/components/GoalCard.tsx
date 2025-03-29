'use client';
import React,{ useEffect, useState} from 'react';
import { Goal } from '../../../types/goals';
import { apiRequest } from '../../../assets/utilities/API_HANDLER';
import styles from '../goals.module.css';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Button,
  Collapse,
  Box,
  Divider
} from '@mui/material';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onAddMoney: (goal: Goal) => void;
}

// A helper that returns time remaining if a valid targetDate exists.
const calculateTimeRemaining = (targetDate?: Date) => {
  if (!targetDate) return { days: 0, isPastDue: false };
  const now = new Date();
  const diffTime = new Date(targetDate).getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { days: diffDays, isPastDue: diffDays <= 0 };
};

export default function GoalCard({ goal, onEdit, onDelete, onViewDetails, onAddMoney }: GoalCardProps) {
  const isSpendingLimit = goal.type === 'Spending Limit';
  const isSavings = goal.type === 'Savings';
  const [accounts, setAccounts] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [goalState, setGoalState] = useState({
    progress: 0,
    progressText: '',
    timeRemainingText: ''
  });
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const toggleExpand = (goalId: string) => {
    setExpandedGoalId((prev) => (prev === goalId ? null : goalId));
  };

  const isExpanded = expandedGoalId === goal._id;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await apiRequest('/accounts', { requireAuth: true });
        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
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

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const fillGoalCard = (goal: Goal) => {
    let progress = 0;
    let progressText = '';
    let timeRemainingText = '';

    if (isSpendingLimit) {
      progress = calculateProgress(goal.currentAmount, goal.limitAmount);
      progressText = `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`;
      if (goal.interval === 'Date') {
        const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
        timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
      } else {
        timeRemainingText = "N/A"; // No targetDate for Spending Limit goals
      }
    } else if (isSavings) {
      progress = calculateProgress(goal.currentAmount, goal.targetAmount);
      progressText = `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`;
      if (goal.targetDate) {
        const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
        timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
      } else {
        timeRemainingText = "N/A";
      }
    }

    setGoalState(prevState => {
      if (prevState.progress !== progress || prevState.progressText !== progressText || prevState.timeRemainingText !== timeRemainingText) {
        return {
          progress,
          progressText,
          timeRemainingText
        };
      }
      return prevState;
    });
  };

  useEffect(() => {
    fillGoalCard(goal);
  }, [goal]);

  const account = accounts.find(acc => acc._id === goal.selectedAccount) || { name: 'N/A' };

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isSpendingLimit ? 'Spending Limit' : 'Savings Goal'}: {goal.title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {isSpendingLimit
            ? `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`
            : `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`
          }
        </Typography>

        <LinearProgress
          variant="determinate"
          value={goalState.progress}
          sx={{ mt: 1, mb: 2, height: 8, borderRadius: 5 }}
        />

        <Typography variant="body2">Account: {account.name}</Typography>
        {isSpendingLimit && <Typography variant="body2">Category: {goal.category}</Typography>}
        <Typography variant="body2">{goalState.timeRemainingText}</Typography>

        {isSavings && goal.subGoals?.length > 0 && (
          <>
            <Button size="small" onClick={() => setExpanded(prev => !prev)}>
              {expanded ? 'Hide Sub-goals ▲' : 'Show Sub-goals ▼'}
            </Button>
            <Collapse in={expanded}>
              <Box sx={{ mt: 1 }}>
                {goal.subGoals.map(subGoal => (
                  <Box key={subGoal._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{subGoal.name}</Typography>
                    <Typography variant="body2">
                      ${subGoal.currentAmount.toLocaleString()} / ${subGoal.goalAmount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Box>
          <Button onClick={onViewDetails} size="small">Details</Button>
          <Button onClick={() => onEdit(goal)} size="small">Edit</Button>
          <Button onClick={onDelete} size="small" color="error">Delete</Button>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={() => onAddMoney(goal)}
        >
          {isSpendingLimit ? 'Add Spending' : 'Add Money'}
        </Button>
      </CardActions>
    </Card>
  );
}