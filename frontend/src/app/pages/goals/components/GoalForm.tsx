
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../assets/utilities/API_HANDLER';
import styles from '../goals.module.css';

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
    targetAmount: "0",
    selectedAccount: '',
    targetDate: getNextMonthDate(),
    limitAmount: "0",
    category: '',
    interval: 'Daily',
    subGoals: [{ id: Date.now(), name: '', amount: "0"}],
  };
  const initialGoal = initialGoalProp || defaultInitialGoal;

  
  // Use strings for numeric fields so they can be cleared.
  const [type, setType] = useState(initialGoal.type || 'Savings');
  const [accounts, setAccounts] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [subGoals, setSubGoals] = useState([{ name: '', amount: 0 }]);
  const [goalName, setGoalName] = useState(initialGoal?.goalName || "");
  const [goalAmount, setGoalAmount] = useState(initialGoal?.goalAmount || 0);
  const [limitAmount, setLimitAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate]= useState(getNextMonthDate()); 
  const [interval, setInterval] = useState('Daily');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state  const [isAddingGoal, setIsAddingGoal] = useState(false); 
  const [subGoalAmount, setSubGoalAmount] = useState(); 
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);


  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts...');
        const data = await apiRequest('/accounts', { requireAuth: true });
    
        console.log('Raw response:', data);
    
        if (Array.isArray(data.accounts)) {
          setAccounts(data.accounts);
          // Set default selected account if necessary, e.g., first account:
          if (data.accounts.length > 0) {
            setSelectedAccount(data.accounts[0]); // Set the first account as the default
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


    // Fetch unique categories for the filter dropdown
    const fetchAvailableCategories = async () => {
      try {
        const response = await apiRequest('/transactions/categories');
        setAvailableCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchAccounts();
    fetchAvailableCategories(); 
  }, []);  // Runs once when the component mounts

  


  // Add a new sub-goal with a unique id
  const addSubGoal = () => {
    setSubGoals([
      ...subGoals,
      { name: '', goalAmount: 0, currentAmount: 0 }  // Initialize with the correct default fields
    ]);
  };
  

  const removeSubGoal = (index) => {
    setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  // Update a sub-goal field.
  const handleSubGoalChange = (index, field, value) => {
    const newSubGoals = [...subGoals];
    if (field === 'amount') {
      newSubGoals[index]['amount'] = parseFloat(value) || 0; // Update 'amount' instead of 'goalAmount'
    } else {
      newSubGoals[index][field] = value;
    }
    setSubGoals(newSubGoals);
  };

  // Update goal type and reset related fields.
  const handleTypeChange = (e) => {
    setType(e.target.value);
    setSubGoals([{ name: '', amount: 0 }]);  // Use number instead of string
    setTargetAmount(0);
    setLimitAmount(0);
  };

  const handleSubGoalAmountChange = () => {
    const totalSubGoalAmount = subGoals.reduce(
      (sum, sg) => sum + (parseFloat(sg.amount) || 0), // Ensure proper handling of numbers
      0
    );
    if (totalSubGoalAmount > parseFloat(goalAmount)) {
      setError('Sub-goal amounts cannot exceed total goal amount.');
    } else {
      setError(null);
    }
  };
  
  

  const handleGoalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };
  

  const validateSubGoals = () => {
    return subGoals.every((subGoal) => subGoal.name && subGoal.goalAmount >= 0 && subGoal.currentAmount >= 0);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      // Build the goal data object conditionally

  //     if (!validateSubGoals()) {
  //   setError("All sub-goals must have a name, goal amount, and current amount.");
  //   return;
  // }

      console.log("trying to submit form"); 
      const goalData = {
        title: goalName || "",
        targetAmount: parseFloat(goalAmount) || 0,
        currentAmount: 0,
        selectedAccount: selectedAccount || null,
        type: type || "Savings", 

        // Only include targetDate and category for Savings goals
        ...(type === 'Savings' ? { 
            targetDate: targetDate || getNextMonthDate(),  // targetDate is already in YYYY-MM-DD format
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
          ...(interval === "Date" ? {
            targetDate: targetDate || getNextMonthDate(), 
          } : {
            targetDate: getNextMonthDate(),
          })
        })
      };

      console.log("trying to submit form", goalData);
  
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
        <h2>{initialGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1>Add New Goal</h1>
          <div className={`${styles.savingsGoal} ${styles.formGroup}`}>
            <label htmlFor="goalType">Goal Type</label>
            <select id="goalType" value={type} onChange={handleGoalTypeChange}>
              <option value="Savings">Savings</option>
              <option value="Spending Limit">Spending Limit</option>
            </select>


            <label htmlFor="goalName">Goal Name</label>
            <input
              type="text"
              id="goalName"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
            />

            {type === 'Savings' && (
              <>
                <div className={styles.goalAmount}>
                  <label htmlFor="goalAmount">Goal Amount</label>
                  <input
                    type="number"
                    id="goalAmount"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(Number(e.target.value))}
                    required
                  />
                </div>

              <div className={styles.formGroup}>
                <label>Target Date</label>
                <input
                    type="date"
                    value={
                      targetDate
                        ? targetDate.toISOString().split('T')[0]
                        : ''
                    }
                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value + 'T00:00:00'); // Ensure local time
                      setTargetDate(selectedDate);
                    }}
                    required
                  />
              </div>

              <label htmlFor="selectedAccount">Account</label>
              <select
                id="selectedAccount"
                value={selectedAccount ? selectedAccount._id : ''} // Use the _id of the selected account
                onChange={(e) => {
                  const selected = accounts.find(account => account._id === e.target.value); // Find the full object
                  setSelectedAccount(selected); // Set the entire object as the selected account
                }}
                required
              >
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}> {/* Use account._id as the value */}
                    {account.name} {/* Display the account name */}
                  </option>
                ))}
              </select>


            {/* Subgoals */}
            <h3 style={{ paddingTop: '20px' }}>Sub-Goals</h3>
            {subGoals.map((subGoal, index) => (
              <div key={index} className={styles.subGoals}>
                <div className={styles.subGoalsInput}>
                  <label htmlFor="sub-goal-name">Sub-Goal Name</label>
                  <input
                    id="sub-goal-name"
                    type="text"
                    placeholder="Name"
                    value={subGoal.name}
                    onChange={(e) => handleSubGoalChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className={styles.subGoalsInput}>
                  <label htmlFor="sub-goal-amount">Amount</label>
                  <input
                    id="sub-goal-amount"
                    type="number"
                    placeholder="Amount"
                    value={subGoal.amount}  // Ensure we're using 'amount'
                    onChange={(e) => handleSubGoalChange(index, 'amount', e.target.value)}  // Correctly update 'amount'
                    onBlur={handleSubGoalAmountChange}  // Optional: for validation
                  />
                </div>
                <button type="button" onClick={() => removeSubGoal(index)}>
                  Remove Sub-Goal
                </button>
              </div>
            ))}

          
          <button type="button" onClick={addSubGoal}>
            Add Sub-Goal
          </button>
          </>
        )}

        {type === 'Spending Limit' && (
          <>
          <div className={styles.limitAmount}>
            <label htmlFor="limit">Limit Amount</label>

            <input
              type='number'
              id="limit"
              value={limitAmount}
              onChange={(e) => setLimitAmount(parseFloat(e.target.value))}
              required
            />
            </div>

            <label htmlFor="category">Category</label>
            {/* <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Entertainment">Shopping</option>
              <option value="Entertainment">Other</option>
            </select> */}

            <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {availableCategories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

            <label htmlFor="interval">Target Interval</label>
            <select id="interval" value={interval} onChange={(e) => setInterval(e.target.value)} required>
              <option value="Date">Date</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Annually">Annually</option>
            </select>

            {interval === "Date" && (
              <>
                <div className={styles.formGroup}>
                <label>Target Date</label>
                <input
                  type="date"
                  value={targetDate ? targetDate.toISOString().split('T')[0] : ''}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value + 'T00:00:00'); // Ensure local time
                    setTargetDate(selectedDate);
                  }}
                  required
                />
                </div>
              </>
            )}

{/* 
            {type === 'Spending Limit' && (
              <>
                <label htmlFor="limitAmount">Limit Amount</label>
                <input
                  type="number"
                  id="limitAmount"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  style={noSpinnerStyle}
                  required
                />

                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Entertainment">Shopping</option>
                  <option value="Entertainment">Other</option>

                </select>

                <label htmlFor="interval">Target Interval</label>
                <select
                  id="interval"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  required
                >
                  {/* <option value="Date">Date</option> */}
                  {/* <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                </select>
              // </>
            )} */} 
            </>
          )}
          

          <button type="submit" disabled={isLoading} onClick={(handleSubmit)}>
            Finish
          </button>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {error && <div className={styles.error}>{error}</div>}
        </div>
        </form>



      </div>

         </div>
        );
     

}

