'use client';
import { useState, useEffect } from "react";
import Card from "../../../components/Card";
import { ResponsiveContainer } from "recharts";
import styles from '../Analysis.module.css';


interface RecurringExpenses {
    category: string,
    frequency: string, 
    nextPaymentDate: string, 
    name: string, 
    amount: number
}
interface RecurringExpensesProps {
    recurringExpenses: RecurringExpenses[]; 
}

const RecurringExpenses = ({ recurringExpenses}: RecurringExpensesProps) => {
    const [loading, setLoading] = useState(true); 
    const [expenses, setExpenses] = useState<RecurringExpenses[]>([]);
    
    useEffect(() => {
        if(recurringExpenses.length > 0) {
            
            setExpenses([...recurringExpenses]); 
            setLoading(false); 
        } 
    }, [recurringExpenses]);

    if (loading) {
        return (
            <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
                <h4 style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: 15 }}>Recurring Expenses</h4> 
                <p>Loading...</p>
            </Card>
        );
    }

    return (
        <Card style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
            <h4 style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: 15 }}>Recurring Expenses</h4> 
            <table className={styles.expensesTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Frequency</th>
                        <th>Next Payment Date</th>
                    </tr>
                </thead>
                <tbody>
                    {recurringExpenses.map((expense, index) => (
                        <tr key={index}>
                            <td>{expense.name}</td>
                            <td>${expense.amount ? expense.amount.toFixed(2) : 'N/A'}</td>
                            <td>{expense.frequency || 'Monthly'}</td>
                            <td>{expense.nextPaymentDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
{/*             
            <div  style={{ flex: 1, minHeight: "350px", minWidth: "300px"}}> 
                <ResponsiveContainer width="100%" height="100%">
                    <h4>expenses</h4>
                </ResponsiveContainer>
            </div> */}
        
        </Card>

    );
}; 


export default RecurringExpenses; 

