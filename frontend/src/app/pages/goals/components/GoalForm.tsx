
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../assets/utilities/API_HANDLER';
import styles from '../goals.module.css';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Typography,
  Box,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


export default function GoalForm({ onClose, onSubmit, initialGoal: initialGoalProp }) {
  
  const getNextMonthDate = () => {
    const today = new Date();
    const nextMonthDate = new Date(today.setMonth(today.getMonth() + 1));
    return nextMonthDate;  // Return a Date object directly
  };

  
  // Define default values
  const defaultInitialGoal = {
    type: 'Savings',
    title: '',
    targetAmount: '',
    selectedAccount: '',
    targetDate: getNextMonthDate(),
    limitAmount: '0',
    category: '',
    interval: 'Daily',
    subGoals: [],
  };

  const initialGoal = initialGoalProp ?? defaultInitialGoal;


  
  // Use strings for numeric fields so they can be cleared.
  const [type, setType] = useState(initialGoal?.type || 'Savings');
  const [accounts, setAccounts] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [subGoals, setSubGoals] = useState(Array.isArray(initialGoal.subGoals) ? initialGoal.subGoals : []);
  const [goalName, setGoalName] = useState(initialGoal?.goalName || "");
  // const [goalAmount, setGoalAmount] = useState(Number(initialGoal?.goalAmount) || 0);
  const [limitAmount, setLimitAmount] = useState(initialGoal?.limitAmount ?? '');

  const [goalAmount, setGoalAmount] = useState(initialGoal?.targetAmount ?? '');



  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState(
    initialGoal?.targetDate ? new Date(initialGoal.targetDate) : getNextMonthDate()
  );
  const [interval, setInterval] = useState('Daily');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isMatchingTotals, setMatchingTotals] = useState(true); // State to track if sub-goal amounts match the total goal amount
  const [newSubGoal, setNewSubGoal] = useState({
    name: "",
    currentAmount: 0,
    goalAmount: 0,
  });
  const [hasSubGoals, setHasSubGoals] = useState(false); // State to track if sub-goals are present
  const [updatedSubGoals, setUpdatedSubGoals] = useState([]); // State to track updated sub-goals

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);


  useEffect(() => {
    const fetchAccounts = async () => {
      try {

        const data = await apiRequest('/accounts', { requireAuth: true });

    
        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          // Set default selected account if necessary, e.g., first account:
          if (data.accounts.length > 0) {
            setAccounts(data.accounts);

            // If editing, match account by ID
            if (initialGoalProp?.selectedAccount) {
              const match = data.accounts.find(
                (acc) => acc._id === initialGoalProp.selectedAccount
              );
              setSelectedAccount(match || data.accounts[0]); // fallback to first if not found
            } else {
              setSelectedAccount(data.accounts[0]); // default if adding
            }
          }
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

  }, [accounts]);  // Runs once when the component mounts


  useEffect(() => {
  // Fetch unique categories for the filter dropdown
  const fetchAvailableCategories = async () => {
    try {
      const response = await apiRequest('/transactions/categories');
      setAvailableCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  fetchAvailableCategories();
  }), [availableCategories];
  


  // Add a new sub-goal with a unique id
  const addSubGoal = () => {
    setSubGoals([
      ...subGoals,
      { name: '', goalAmount: 0, currentAmount: 0 }  // Initialize with the correct default fields
    ]);
  };
  

  const removeSubGoal = (index) => {
    const updated = subGoals.filter((_, i) => i !== index);
    setSubGoals(updated);

    let updatedSubGoals = updated.map(subGoal => ({
      ...subGoal,
      currentAmount: updated.length > 0 ? initialGoal.currentAmount / updated.length : 0,
      goalAmount: updated.length > 0 ? initialGoal.targetAmount / updated.length : 0
    }));

    setUpdatedSubGoals(updatedSubGoals);

    const updatedGoal = {
      ...initialGoal,
      subGoals: updatedSubGoals
    };

    editGoal(updatedGoal, initialGoal._id); // Call editGoal with the updated sub-goals

    if(updatedSubGoals.length === 0){
      setMatchingTotals(true);
    }

  };

  const editGoal = async (updatedGoal: any, goalId: string) => {
      try {
        // setIsLoading(true);
        setError(null);

        // Ensure subGoals exist before mapping
        const updatedSubGoals = updatedGoal.subGoals && updatedGoal.subGoals.length > 0
        ? updatedGoal.subGoals.map((subGoal: any) => ({
            name: subGoal.name,
            goalAmount: Number(subGoal.amount),
            currentAmount: Number(subGoal.currentAmount) || 0,
          }))
        : []; // ✅ Always send an empty array if there are no sub-goals


        const goalToUpdate = {
          id: initialGoal._id,
          title: updatedGoal.title || initialGoal.title,
          description: updatedGoal.description || initialGoal.description,
          targetAmount: Number(updatedGoal.targetAmount) || initialGoal.targetAmount,
          currentAmount: Number(updatedGoal.currentAmount) || initialGoal.currentAmount,
          targetDate: updatedGoal.targetDate instanceof Date
            ? updatedGoal.targetDate.toISOString()
            : new Date(getNextMonthDate()).toISOString() || initialGoal.targetDate.toISOString(),
          category: updatedGoal.category || initialGoal.category,
          type: updatedGoal.type || initialGoal?.type,
          interval: updatedGoal.interval || initialGoal?.interval,
          subGoals: updatedGoal.subGoals.length > 0 ? updatedGoal.subGoals.map((subGoal: any, index: number) => ({
            name: subGoal.name || initialGoal?.subGoals[index]?.name,
            goalAmount: Number(subGoal.goalAmount) ,
            currentAmount: Number(subGoal.currentAmount),
          })) : [],
          selectedAccount: updatedGoal.selectedAccount || initialGoal?.selectedAccount || null,
          limitAmount: updatedGoal.limitAmount || initialGoal.limitAmount || 0,
        };


        const savedGoal = await apiRequest<Goal>(`/goals/${goalToUpdate.id}`, {
          method: 'PUT',
          body: goalToUpdate,
          requireAuth: true
        });

        savedGoal.targetDate = new Date(savedGoal.targetDate);

        setEditingGoal(null);

      } catch (error) {
        console.error('Error updating goal:', error);
        setError('Failed to update your goal. Please try again.');
      } finally {

      }
    };


  const checkMatchingTotals = () => {

    if(subGoals.length === 0){

      setMatchingTotals(true); // No sub-goals, so they match by default
      return;
    }
    const totalSubGoalAmount = subGoals.reduce(
      (sum, sg) => sum + (parseFloat(sg.amount) || 0), // Ensure proper handling of numbers
      0
    );
    const totalGoalAmount = parseFloat(goalAmount) || 0; // Ensure goalAmount is a number
    setMatchingTotals(totalSubGoalAmount === totalGoalAmount);

    // console.log('Matching Totals:', isMatchingTotals);
    if(!isMatchingTotals && subGoals.length > 0){
      setError('Sub-goal amounts must match the total goal amount.');
    } else {
      setError(null);
    }
  };



  useEffect(() => {
    checkMatchingTotals();
  }, [goalAmount, subGoals]); // Check whenever goalAmount or subGoals change 



  // Update a sub-goal field.
  const handleSubGoalChange = (index, field, value) => {

    //check if goal has subgoals initialized
    if (!Array.isArray(subGoals) || subGoals.length === 0) {
      setSubGoals([{ _id:  Date.now(),  name: '', amount: 0 }]); // Initialize with a default sub-goal
    }
    const newSubGoals = [...subGoals];
    if (field === 'amount') {
      newSubGoals[index]['amount'] = parseFloat(value) || 0; // Update 'amount' instead of 'goalAmount'
    } else {
      newSubGoals[index][field] = value;
    }
    setSubGoals(newSubGoals);

  };
  

  

  const handleGoalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    // Ensure the sub-goal amounts match the total goal amount before submission
    const totalSubGoalAmount = subGoals.reduce((sum, sg) => sum + (parseFloat(sg.amount) || 0), 0);
    const totalGoalAmount = parseFloat(goalAmount) || 0;

    if (!isMatchingTotals) {
      setError('Sub-goal amounts must match the total goal amount.');
      setIsLoading(false);
      return;
    }

    try {
      const goalData = {
        title: goalName || "",
        targetAmount: totalGoalAmount,
        currentAmount: 0,
        selectedAccount: selectedAccount || null,
        type: type || "Savings",
        ...(type === 'Savings' ? { 
          targetDate: targetDate || getNextMonthDate(),
          subGoals: subGoals.map((sg) => ({
            ...sg,
            name: sg.name,
            amount: sg.amount,
            currentAmount: 0
          })),
        } : {
          category: category || "", 
          limitAmount: limitAmount || 0,
          interval: interval || "Monthly",
          ...(interval === "Date" ? { targetDate: targetDate || getNextMonthDate() } : { targetDate: getNextMonthDate() })
        })
      };
  
      console.log("Submitting form:", goalData);
      await onSubmit(goalData);
      onClose();
    } catch (error) {
      setError('Failed to create goal.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <Typography variant="h5" gutterBottom>
          {initialGoalProp ? 'Edit Goal' : 'Add New Goal'}
        </Typography>
        <form onSubmit={handleSubmit} className={styles.form}>
          <FormControl fullWidth sx={{ mb: 2 }} size="small">
            <InputLabel id="goal-type-label">Goal Type</InputLabel>
            <Select
              labelId="goal-type-label"
              id="goalType"
              value={type}
              label="Goal Type"
              onChange={handleGoalTypeChange}
            >
              <MenuItem value="Savings">Savings</MenuItem>
              <MenuItem value="Spending Limit">Spending Limit</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            id="goalName"
            label="Goal Name"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
            sx={{ mb: 2 }}
            size="small"
          />



{/* ginelle's version */}
            {type === 'Savings' && (
              <>

              <TextField
                fullWidth
                className={styles.goalAmount}
                id="goalAmount"
                label="Goal Amount"
                type="number"
                value={goalAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  setGoalAmount(value === '' ? '' : Number(value));
                }}
                required
                sx={{ mb: 2 }}
                size="small"
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Target Date"
                  value={targetDate ? dayjs(targetDate) : null}
                  onChange={(newValue) => {
                    setTargetDate(newValue ? newValue.toDate() : null);
                  }}
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      size: 'small',
                      sx: { mb: 2 },
                    },
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel id="account-label">Account</InputLabel>
                <Select
                  labelId="account-label"
                  id="selectedAccount"
                  value={selectedAccount ? selectedAccount._id : ''}
                  label="Account"
                  onChange={(e) => {
                    const selected = accounts.find(
                      (acc) => acc._id === e.target.value
                    );
                    setSelectedAccount(selected);
                  }}
                  required
                >
                  {accounts.map((account) => (
                    <MenuItem key={account._id} value={account._id}>
                      {account.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Sub-Goals
              </Typography>

              {subGoals.map((subGoal, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    mt: 1,
                    mb: 1,
                  }}
                >
                  <TextField
                    label="Sub-Goal Name"
                    value={subGoal.name}
                    onChange={(e) =>
                      handleSubGoalChange(index, 'name', e.target.value)
                    }
                    fullWidth
                    size="small"
                  />
                  <TextField
                    className={styles.goalAmount}
                    label="Amount"
                    type="number"
                    value={subGoal.amount ?? ''}
                    onChange={(e) =>
                      handleSubGoalChange(index, 'amount', e.target.value)
                    }
                    sx={{ width: 200 }}
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeSubGoal(index)} disabled= {false}
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}

              <Button
                variant="outlined"
                color="primary"
                onClick={addSubGoal}
                sx={{ mt: 1, mb: 3 }}
                size="small"
              >
                Add Sub-Goal
              </Button>

          </>
        )}

        {type === 'Spending Limit' && (
          <>
            <TextField
              fullWidth
              className={styles.goalAmount}
              id="limitAmount"
              label="Limit Amount"
              type="number"
              value={limitAmount}
              onChange={(e) => {
                const value = e.target.value;
                setLimitAmount(value === '' ? '' : Number(value));
              }}
              required
              sx={{ mb: 2 }}
              size="small"
            />

            <FormControl fullWidth sx={{ mb: 2 }} size="small">
              <InputLabel id="account-label">Account</InputLabel>
              <Select
                labelId="account-label"
                id="selectedAccount"
                value={selectedAccount ? selectedAccount._id : ''}
                label="Account"
                onChange={(e) => {
                  const selected = accounts.find(
                    (acc) => acc._id === e.target.value
                  );
                  setSelectedAccount(selected);
                }}
                required
              >
                {accounts.map((account) => (
                  <MenuItem key={account._id} value={account._id}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel id="account-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category ? category : ''}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {availableCategories.map((category, index) => (
                    <MenuItem key={index} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel id="account-label">Interval</InputLabel>
                <Select
                  labelId="interval-label"
                  id="interval"
                  value={interval ? interval : 'Monthly'}
                  label="Interval"
                  onChange={(e) => setInterval(e.target.value)}
                  required
                >
                  <MenuItem value="Date">Date</MenuItem>
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Annually">Annually</MenuItem>
                </Select>
              </FormControl>

              {interval === "Date" && (
              <>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Target Date"
                    value={targetDate ? dayjs(targetDate) : null}
                    onChange={(newValue) => {
                      setTargetDate(newValue ? newValue.toDate() : null);
                    }}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: 'small',
                        sx: { mb: 2 },
                      },
                    }}
                  />
                </LocalizationProvider>

              </>
            )}
            </>
            )}


          {error && (
            <FormHelperText error sx={{ mb: 2 }}>
              {error}
            </FormHelperText>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                isLoading ||
                !goalName ||
                (type === "Savings" && !goalAmount && !targetDate && !selectedAccount) ||
                (type === "Spending Limit" && !limitAmount && !category && !interval)
              }
              size="small"
            >
              Save
            </Button>
          </Box>

        </form>
      </div>
    </div>
  );
}

