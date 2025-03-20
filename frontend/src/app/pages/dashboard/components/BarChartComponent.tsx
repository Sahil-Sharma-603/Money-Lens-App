"use client";

import { useState, useEffect } from "react";
import Card from "../../../components/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ClipLoader } from "react-spinners";
import { Select, MenuItem } from "@mui/material";

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

const getFilteredData = (data: MonthlySpending[], range: string) => {
  let filteredData = [];

  switch (range) {
    case "month":
      filteredData = data.slice(0,1);
      break;
    case "6months":
      filteredData = data.slice(0,6);
      break;
    case "year":
      filteredData = data.slice(-12);
      break;
    default:
      filteredData = data;
  }
  return filteredData;
};

const BarChartComponent = ({ monthlySpending }: BarChartProps) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<MonthlySpending[]>([]);
  const [timeRange, setTimeRange] = useState("year");

  useEffect(() => {
    if (monthlySpending.length > 0) {
      setTimeout(() => {
        const filteredData = getFilteredData(monthlySpending, timeRange);
        setChartData(
          filteredData.reverse().map((entry) => ({
            month: formatMonth(entry.month),
            fullMonth: formatMonth(entry.month, true),
            spent: entry.spent,
            earned: Math.abs(entry.earned),
          }))
        );
        setLoading(false);
      }, 100);
    }
  }, [monthlySpending, timeRange]);

  return (
    <Card style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100px", maxHeight: "500px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <h4 style={{ fontWeight: "600", fontSize: "0.9rem" }}>Summary</h4>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} size="small"
          sx={{
              fontSize: '0.8rem',
              fontFamily: 'Jost',
              "& .MuiSvgIcon-root": {
              fontSize: '1rem'
              }
          }}>
          <MenuItem sx={{ fontFamily: 'Jost' }} value="month">Past Month</MenuItem>
          <MenuItem sx={{ fontFamily: 'Jost' }} value="6months">Past 6 Months</MenuItem>
          <MenuItem sx={{ fontFamily: 'Jost' }} value="year">Past Year</MenuItem>
        </Select>
      </div>

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
