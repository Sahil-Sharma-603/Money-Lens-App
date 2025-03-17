'use client';

import { useState, useEffect } from "react";
import Card from "../../../components/Card";
import { PieChart, ResponsiveContainer } from "recharts";
import { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";


interface CatPieProps {
    spendingByCategory: CatPieProps[]; 
}
const formatCategory = (

); 

const CategoryPieChart = ({ spendingByCategory}: CatPieProps) => {
    const [loading, setLoading] = useState(true); 
    const [chartData, setChartData] = useState<CatPieProps[]>([]);
    
    useEffect(() => {
        setTimeout(() => {
            setChartData([...spendingByCategory])

        
        })
        setLoading(false); 
    }); 
    
}, [spendingByCategory]); 


return (
    <Card style = {{ flex: 1, display: "flex"}}>
        <h4 style = {{ fontWeight: "600", fontSize: "0.9rem", marginBottom: 15 }}>Spending by Category </h4> 
    
    </Card>
)