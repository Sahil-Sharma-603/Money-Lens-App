// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Goal } from '../../../types/goals';
// import { apiRequest } from '../../../assets/utilities/API_HANDLER';
// import {
//   Card,
//   CardContent,
//   CardActions,
//   Typography,
//   LinearProgress,
//   Button,
//   Collapse,
//   Box,
//   Divider
// } from '@mui/material';
// import styles from '../goals.module.css';

// interface GoalCardProps {
//   goal: Goal;
//   onEdit: (goal: Goal) => void;
//   onDelete: () => void;
//   onViewDetails: () => void;
//   onAddMoney: (goal: Goal) => void;
// }

// const calculateTimeRemaining = (targetDate?: Date) => {
//   if (!targetDate) return { days: 0, isPastDue: false };
//   const now = new Date();
//   const diffTime = new Date(targetDate).getTime() - now.getTime();
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return { days: diffDays, isPastDue: diffDays <= 0 };
// };

// export default function GoalCard({ goal, onEdit, onDelete, onViewDetails, onAddMoney }: GoalCardProps) {
//   const isSpendingLimit = goal.type === 'Spending Limit';
//   const isSavings = goal.type === 'Savings';
//   const [progress, setProgress] = useState(0);
//   const [accounts, setAccounts] = useState([]);
//   const [expanded, setExpanded] = useState(false);
//   const [progressText, setProgressText] = React.useState("");
//   const [additionalInfo, setAdditionalInfo] = React.useState<React.ReactNode>(null);
//   const [timeRemainingText, setTimeRemainingText] = React.useState('');
//   const isCompleted = goal.currentAmount >= goal.targetAmount;
//   // const [accounts, setAccounts] = React.useState([]);
//   const [goalState, setGoalState] = useState({
//     progress: 0,
//     progressText: '',
//     timeRemainingText: ''
//   });
  

//   const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
//   const [forceRender, setForceRender] = useState(false);

//   const toggleExpand = (goalId: string) => {
//     setExpandedGoalId((prev) => (prev === goalId ? null : goalId));
//     // setForceRender((prev) => !prev); // Forces a re-render
//     // setExpanded(!expanded); 
//   };

//   const isExpanded = expandedGoalId === goal._id;


//   useEffect(() => {
//       const fetchAccounts = async () => {
//         try {
          
//           const data = await apiRequest('/accounts', { requireAuth: true });
      
//           if (Array.isArray(data.accounts)) {
//             setAccounts(data.accounts);
//             // Set default selected account if necessary, e.g., first account:
            
//           } else {
//             console.error('Unexpected response format:', data);
//             setAccounts([]);
//           }
//         } catch (error) {
//           console.error('Error fetching accounts:', error);
//           setAccounts([]);
//         }
//       };
        
//       fetchAccounts();
      
//     }, []); 




//   const spendingView = (goal: Goal) => {
//     let account = accounts.find((account) => account._id === goal.selectedAccount);

//     if (!account) {
//       account = { _id: goal.selectedAccount, name: goal.selectedAccount }; // Fallback if not found
//     } else if( !goal.selectedAccount) {
//       account = { _id: 0, name: "N/A" }; // Fallback if not found
//     }

//     let timeRemainingText; 
//     if(goal.interval === 'Date') {
//       const { days, isPastDue } =  calculateTimeRemaining(new Date(goal.targetDate));
//       timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
//     } 

//     return (
//       <>
//         {account.name && <p>Account: {account.name}</p>}
//         <p>Category: {goal.category}</p>
//         {goal.interval === "Date" ? (
//         <p> {timeRemainingText}</p> // Format the date as needed
//       ) : (
//         <p>Interval: {goal.interval}</p>
//       )}
//       </>
//     ); 

//   }
//   const savingsView = (goal: Goal) => { 
//     const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
//     const timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
  
//     let account = accounts.find((account) => account._id === goal.selectedAccount) || 
//                   { _id: goal.selectedAccount, name: goal.selectedAccount || "N/A" };
  
//     const isExpanded = expandedGoalId === goal._id;

//     const updatedSubGoals = goal.subGoals?.map((subGoal) => ({
//       ...subGoal,
//       currentAmount: goal.currentAmount * (subGoal.goalAmount / goal.targetAmount),
//     }));
  
//     return (
//       <div>
//         <p>Account: {account.name}</p>
//         <p>{timeRemainingText}</p>
  
//         {goal.subGoals && goal.subGoals.length > 0 && (
//           <div>
//             <button 
//               className={styles.expandButton} 
//               onClick={() => toggleExpand(goal._id)}
//             >
//               {isExpanded ? 'Hide Sub-goals ▲' : 'Show Sub-goals ▼'}
//             </button>
  
//             {isExpanded && (
//               <div className={styles.goalCardSubGoals}>
//                 {updatedSubGoals.map((subGoal) => (
//                   <div key={subGoal._id} className={styles.goalCardSubGoals}>
//                     <div className={styles.subGoalItem}><p >Sub-goal: {subGoal.name}</p></div>
//                     <div className={styles.subGoalItem}><p >${subGoal.currentAmount.toLocaleString()} / ${subGoal.goalAmount.toLocaleString()}</p></div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   };
  
//   const getAccount = (goal: Goal) => {
//     let account = accounts.find((account) => account._id === goal.selectedAccount);
//     return account; 
//   };

//   // const fillGoalCard = (goal: Goal) => {
//   //   if (isSpendingLimit) {
//   //     setProgress(Math.min((goal.currentAmount / goal.limitAmount) * 100, 100));
//   //   } else {
//   //     setProgress(Math.min((goal.currentAmount / goal.targetAmount) * 100, 100));
//   //   }
//   // }; //, [goal];

//   //   const isCompleted = progress >= 100;
//   // // }

//   // const setGoalState = (goal: Goal) => {

//   // }
  
  

//   const fillGoalCard = (goal: Goal) => {
//     if (isSpendingLimit) {

//       setGoalState({
//         progress: calculateProgress(goal.currentAmount, goal.limitAmount),
//         progressText: `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`,
//         timeRemainingText: isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`
//       });

//       // setProgress(calculateProgress(goal.currentAmount, goal.limitAmount));
//       // setProgressText(`Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`);
//       // setAdditionalInfo(spendingView(goal));
//       if (goal.interval === 'Date') {
//         const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
//         // setTimeRemainingText(isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`);
//       } else {
//         setTimeRemainingText("N/A"); // No targetDate for Spending Limit goals
//       }
      
//     } else if (isSavings) {
//       setGoalState({
//         progress: calculateProgress(goal.currentAmount, goal.targetAmount),
//         progressText: `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`,
//         timeRemainingText: isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`
//       });
//       // setProgress(calculateProgress(goal.currentAmount, goal.targetAmount));  
//       // setProgressText(`Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`);
//       // setAdditionalInfo(savingsView(goal, expandedGoalId === goal._id, () => toggleExpand(goal._id)));
//     // );
//       if (goal.targetDate) {
//         const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
//         // setTimeRemainingText(isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`);
//       }
//       else {
//         setTimeRemainingText("N/A");
//       }  

//     }
//     setAdditionalInfo(isSavings ? savingsView(goal) : spendingView(goal));

//     const isCompleted = progress >= 100;
//   }

//   useEffect(() => {
//     // Refill the goal card when the main goal or its sub-goals change
//     fillGoalCard(goal);
//   }, [goal, goal.currentAmount, goal.subGoals]);

//   // useEffect(() => {
//   //   fillGoalCard(goal);
//   // }, [expanded]); 

//   // Set timeRemainingText
//   useEffect(() => {
//     let timeRemainingText; 
//     if(goal.interval === 'Date') {
//       const { days, isPastDue } =  calculateTimeRemaining(new Date(goal.targetDate));
//       timeRemainingText = isPastDue ? `${Math.abs(days)} days overdue` : `${days} days remaining`;
//     } 
//     else {
//       timeRemainingText = `Interval: ${goal.interval}`;
//     }
//   }, [goal.targetDate]);


//   // Calculate progress based on type:
//   const calculateProgress = (current: number, target: number) => {
//     if (target === 0) return 0;
//     return Math.min((current / target) * 100, 100);
//   };


//   const account = accounts.find(acc => acc._id === goal.selectedAccount) || { name: 'N/A' };
//   const { days, isPastDue } = calculateTimeRemaining(new Date(goal.targetDate));
//   setTimeRemainingText(isPastDue
//     ? `${Math.abs(days)} days overdue`
//     : `${days} days remaining`);

// //   return (
// //     <Card variant="outlined" sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
// //       <CardContent >
// //         <Typography variant="h6" gutterBottom>
// //           {isSpendingLimit ? 'Spending Limit' : 'Savings Goal'}: {goal.title}
// //         </Typography>

// //         <Typography variant="body2" color="text.secondary">
// //           {isSpendingLimit
// //             ? `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`
// //             : `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`
// //           }
// //         </Typography>

// //         <LinearProgress 
// //           variant="determinate" 
// //           value={progress} 
// //           sx={{ mt: 1, mb: 2, height: 8, borderRadius: 5 }}
// //         />

// // {/* <div className={styles.goalDetails}>
// //   //       <p>{progressText}</p>
// //   //       {isSavings ? savingsView(goal) : spendingView(goal)}
// //   //       {/* {isSpendingLimit && spendingView(goal)} */}
// //   {/* //       {additionalInfo}
// //   //     </div> */} 

// //         {/* {type === "Savings" && (
// //           <Typography variant="body2" color="text.secondary">
// //             {isCompleted ? 'Goal Completed!' : timeRemainingText}
// //           </Typography> 
            
            
// //         )} : {type === "Spending Limit" && (
// //           <Typography variant="body2" color="text.secondary">
// //             {isCompleted ? 'Spending Limit Reached!' : timeRemainingText}   
// //           </Typography>
// //         )} */}

// //         <Typography variant="body2">Account: {account.name}</Typography>
// //         {isSpendingLimit && <Typography variant="body2">Category: {goal.category}</Typography>}
// //         <Typography variant="body2">{timeRemainingText}</Typography>

// //         {isSavings && goal.subGoals?.length > 0 && (
// //           <>
// //             <Button size="small" onClick={() => setExpanded(prev => !prev)}>
// //               {expanded ? 'Hide Sub-goals ▲' : 'Show Sub-goals ▼'}
// //             </Button>
// //             <Collapse in={expanded}>
// //               <Box sx={{ mt: 1 }}>
// //                 {goal.subGoals.map(subGoal => (
// //                   <Box key={subGoal._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
// //                     <Typography variant="body2">{subGoal.name}</Typography>
// //                     <Typography variant="body2">
// //                       ${subGoal.currentAmount.toLocaleString()} / ${subGoal.goalAmount.toLocaleString()}
// //                     </Typography>
// //                   </Box>
// //                 ))}
// //               </Box>
// //             </Collapse>
// //           </>
// //         )}
// //       </CardContent>

// //       <Divider />

// //       <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
// //         <Box>
// //           <Button onClick={onViewDetails} size="small">Details</Button>
// //           <Button onClick={() => onEdit(goal)} size="small">Edit</Button>
// //           <Button onClick={onDelete} size="small" color="error">Delete</Button>
// //         </Box>
// //         <Button
// //           variant="contained"
// //           size="small"
// //           onClick={() => onAddMoney(goal)}
// //         >
// //           {isSpendingLimit ? 'Add Spending' : 'Add Money'}
// //         </Button>
// //       </CardActions>
// //     </Card>
// //   );




// return (
//   <Card variant="outlined" sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
//     <CardContent>
//       <Typography variant="h6" gutterBottom>
//         {isSpendingLimit ? 'Spending Limit' : 'Savings Goal'}: {goal.title}
//       </Typography>

//       <Typography variant="body2" color="text.secondary">
//         {isSpendingLimit
//           ? `Spent: $${goal.currentAmount.toLocaleString()} / $${goal.limitAmount.toLocaleString()}`
//           : `Progress: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}`
//         }
//       </Typography>

//       <LinearProgress 
//         variant="determinate" 
//         value={goalState.progress} 
//         sx={{ mt: 1, mb: 2, height: 8, borderRadius: 5 }}
//       />

//       <Typography variant="body2">Account: {account.name}</Typography>
//       {isSpendingLimit && <Typography variant="body2">Category: {goal.category}</Typography>}
//       <Typography variant="body2">{goalState.timeRemainingText}</Typography>

//       {isSavings && goal.subGoals?.length > 0 && (
//         <>
//           <Button size="small" onClick={() => setExpanded(prev => !prev)}>
//             {expanded ? 'Hide Sub-goals ▲' : 'Show Sub-goals ▼'}
//           </Button>
//           <Collapse in={expanded}>
//             <Box sx={{ mt: 1 }}>
//               {goal.subGoals.map(subGoal => (
//                 <Box key={subGoal._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                   <Typography variant="body2">{subGoal.name}</Typography>
//                   <Typography variant="body2">
//                     ${subGoal.currentAmount.toLocaleString()} / ${subGoal.goalAmount.toLocaleString()}
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>
//           </Collapse>
//         </>
//       )}
//     </CardContent>

//     <Divider />

//     <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
//       <Box>
//         <Button onClick={onViewDetails} size="small">Details</Button>
//         <Button onClick={() => onEdit(goal)} size="small">Edit</Button>
//         <Button onClick={onDelete} size="small" color="error">Delete</Button>
//       </Box>
//       <Button
//         variant="contained"
//         size="small"
//         onClick={() => onAddMoney(goal)}
//       >
//         {isSpendingLimit ? 'Add Spending' : 'Add Money'}
//       </Button>
//     </CardActions>
//   </Card>
// );



//   // return (
//   //   <div className={`${styles.goalCard} ${isCompleted ? styles.completed : ''}`}>
//   //     <div className={styles.goalHeader}>
//   //       <h2>{isSpendingLimit ? 'Spending Limit' : 'Savings Goal'}</h2>
//   //       <h3>{goal.title}</h3>
//   //       <div className={styles.actions}>
//   //         <button onClick={onViewDetails} disabled={false}>Details</button>
//   //         <button onClick={onEdit} disabled={false}>Edit</button>
//   //         <button onClick={onDelete} disabled={false}>Delete</button>
//   //       </div>
//   //       <button 
//   //         onClick={() => onAddMoney(goal)} disabled={false}
//   //         className={styles.addMoneyButton}
//   //       >
//   //         {isSpendingLimit ? 'Add Spending' : 'Add Money'}
//   //       </button>
//   //     </div>

//   //     <div className={styles.progressBar}>
//   //       <div 
//   //         className={`${styles.progressFill} ${isCompleted ? styles.completed : ''}`}
//   //         style={{ width: `${progress}%` }}
//   //       />
//   //     </div>

//   //     <div className={styles.goalDetails}>
//   //       <p>{progressText}</p>
//   //       {isSavings ? savingsView(goal) : spendingView(goal)}
//   //       {/* {isSpendingLimit && spendingView(goal)} */}
//   //       {/* {additionalInfo} */}
//   //     </div>
//   //   </div>
//   // );
// }

'use client';
import React, { useEffect, useState } from 'react';
import { Goal } from '../../../types/goals';
import { apiRequest } from '../../../assets/utilities/API_HANDLER';
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
import styles from '../goals.module.css';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onAddMoney: (goal: Goal) => void;
}

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

