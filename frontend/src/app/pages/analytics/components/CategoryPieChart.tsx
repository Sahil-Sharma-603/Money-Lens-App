import React, { useEffect, useState } from 'react';
import Card from "../../../components/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ClipLoader } from "react-spinners";

const COLORS = ["#0707E2", "#E80770", "#00A6A6", "#FF5400", "#F47C7C", "#A1DE93", "#6A0572", "#FF8C42", "#7F4A88", "#E1E8F0"];
// const COLORS = ["#0707E2", "#E80770", "#00A6A6", "#FF5400", "#F47C7C", "#A1DE93", "#6A0572", "#FF8C42", "#7F4A88", "#E1E8F0"];

interface CategorySpending {
    category: string;
    amount: number;
}

interface CatPieProps {
    spendingByCategory: { [key: string]: number };
}

const CategoryPieChart: React.FC<CatPieProps> = ({ spendingByCategory }) => {
    const [chartData, setChartData] = useState<CategorySpending[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Convert the spendingByCategory object to an array and sort by amount
        let categoriesArray = Object.keys(spendingByCategory).map(key => ({
            category: key,
            amount: spendingByCategory[key]
        })).sort((a, b) => b.amount - a.amount);

        // If there are more than 9 categories, move the rest into "Other"
        if (categoriesArray.length > 9) {
            const topCategories = categoriesArray.slice(0, 9);
            const otherCategories = categoriesArray.slice(9);
            const otherTotal = otherCategories.reduce((sum, current) => sum + current.amount, 0);

            categoriesArray = [
                ...topCategories,
                { category: "Other", amount: otherTotal }
            ];
        }

        setChartData(categoriesArray);
        setLoading(false);
    }, [spendingByCategory]);

    return (
        <Card className="pieChart" style={{ minWidth: "250px", flex: 1, display: "flex", flexDirection: "column"}}>
            <h4 style={{ fontWeight: "600", fontSize: "0.9rem" }}>Spending by Category</h4>

            {loading ? (
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <ClipLoader color="var(--primary)" size={40} />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            labelLine={false}
                            style={{ fontSize: '0.8rem', fontFamily: 'Jost' }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend verticalAlign="bottom" align="center" height={36} formatter={(value) => <span style={{ fontSize: '0.8rem' }}>{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};

export default CategoryPieChart;
