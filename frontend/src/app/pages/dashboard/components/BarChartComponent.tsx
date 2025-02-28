"use client";

import { useState, useEffect } from "react";
import Card from "../../../components/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ClipLoader } from "react-spinners";

interface MonthlySpending {
  month: string;
  spent: number;
  earned: number;
}

interface BarChartProps {
  monthlySpending: MonthlySpending[];
}

const formatMonth = (monthKey: string, includeYear = false) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [year, month] = monthKey.split("-");
  const monthName = monthNames[parseInt(month, 10) - 1];

  return includeYear ? `${monthName} ${year}` : monthName;
};

const BarChartComponent = ({ monthlySpending }: BarChartProps) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<MonthlySpending[]>([]);

  useEffect(() => {
    if (monthlySpending.length > 0) {
      setTimeout(() => {
        setChartData([...monthlySpending].reverse().map(entry => ({
          month: formatMonth(entry.month),
          fullMonth: formatMonth(entry.month, true),
          spent: entry.spent,
          earned: Math.abs(entry.earned),
        })));
        setLoading(false);
      }, 100); // loading delay
    }
  }, [monthlySpending]);

  return (
    <Card style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100px", maxHeight: "600px" }}>
      <h4 style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: 15 }}>Last 12 Months</h4>

      {loading ? (
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ClipLoader color="var(--primary)" size={40} />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                labelFormatter={(label, payload) => {
                  const matchingEntry = payload?.[0]?.payload;
                  return matchingEntry ? matchingEntry.fullMonth : label;
                }}
                formatter={(value, name) => {
                  const numValue = typeof value === "number" ? value : parseFloat(value as string);
                  const stringName = typeof name === "string" ? name : String(name);
                  return [`$${numValue.toFixed(2)}`, stringName.charAt(0).toUpperCase() + stringName.slice(1)];
                }}
              />
              <Bar dataKey="spent" fill="var(--negative)" />
              <Bar dataKey="earned" fill="var(--positive)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default BarChartComponent;
