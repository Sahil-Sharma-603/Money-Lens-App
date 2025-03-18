'use client';

import { useState, useEffect } from "react";
import Card from "../../../components/Card";
import { PieChart, ResponsiveContainer, Legend, Pie, Cell, Label, Tooltip } from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";
import { ClipLoader } from "react-spinners";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface CategorySpending {
    category: string, 
    amount: number
}
interface CatPieProps {
    spendingByCategory: CategorySpending[]; 
}
// const formatCategory = (

// ); 

const data = [
    {category: "groceries", amount: 300 }, 
    {category: "entertainment", amount: 200},
    {category: "subscriptions", amount: 45}
]

const CategoryPieChart = ({ spendingByCategory}: CatPieProps) => {
    const [loading, setLoading] = useState(true); 
    const [chartData, setChartData] = useState<CategorySpending[]>([]);
    
    useEffect(() => {
        setTimeout(() => {
            setChartData([...spendingByCategory])

        
        })
        setLoading(false); 
    }, [spendingByCategory]);

    return (
        <Card className="pieChart" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
            <h4 style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: 15 }}>Spending by Category</h4> 
            {loading ? (
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ClipLoader color="var(--primary)" size={40} />
                </div>
            ) : (
                <div style={{ width: "100%", height: "100%" }}> 
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie 
                        data={data} 
                        dataKey="amount" 
                        nameKey="category"
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        label
                    > 
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend verticalAlign="top" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
                </div>
            )}
        </Card>

    )
}; 





export default CategoryPieChart; 