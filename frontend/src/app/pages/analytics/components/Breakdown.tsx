"use client";

import React, { useState } from "react";
import Card from "../../../components/Card";
import { Select, MenuItem } from "@mui/material";

interface Source {
    name: string;
    amount: number;
}

interface TopSources {
    topSpending: Source[];
    topEarning: Source[];
}

interface BreakdownProps {
    weekAvg?: { spent: number; earned: number };
    monthAvg?: { spent: number; earned: number };
    yearAvg?: { spent: number; earned: number };
    thisWeek?: { spent: number; earned: number };
    thisMonth?: { spent: number; earned: number };
    thisYear?: { spent: number; earned: number };
    topSources?: {
        thisWeek?: TopSources;
        thisMonth?: TopSources;
        thisYear?: TopSources;
    };
  }

const Breakdown: React.FC<BreakdownProps> = ({
    weekAvg,
    monthAvg,
    yearAvg,
    thisWeek,
    thisMonth,
    thisYear,
    topSources
  }) => {
    const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

    // Pick the correct data set based on the selected timeframe
    const avgData = timeframe === "week" ? weekAvg || { spent: 0, earned: 0 }
            : timeframe === "month" ? monthAvg || { spent: 0, earned: 0 }
            : yearAvg || { spent: 0, earned: 0 };

    const periodData = timeframe === "week" ? thisWeek || { spent: 0, earned: 0 }
            : timeframe === "month" ? thisMonth || { spent: 0, earned: 0 }
            : thisYear || { spent: 0, earned: 0 };

    const topSourcesData = timeframe === "week" ? topSources?.thisWeek || { topSpending: [], topEarning: [] }
            : timeframe === "month" ? topSources?.thisMonth || { topSpending: [], topEarning: [] }
            : topSources?.thisYear || { topSpending: [], topEarning: [] };

    // Convert earned values to positive numbers
    const periodEarned = periodData.earned ? Math.abs(periodData.earned) : 0;

    // Compute net saved as (earned - spent)
    const netAvg = avgData.earned - avgData.spent;
    const netPeriod = periodEarned - periodData.spent;

    const breakdownLabel =
        timeframe.charAt(0).toUpperCase() + timeframe.slice(1) + " Breakdown";

    return (
        <Card style={{display: "flex", flexDirection: "column" }}>
        {/* Header with dropdown and label */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>{breakdownLabel}</h4>
            <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as "week" | "month" | "year")}
                size="small"
                sx={{
                    fontSize: '0.8rem',
                    fontFamily: 'Jost',
                    "& .MuiSvgIcon-root": {
                    fontSize: '1rem'
                    }
                }}
                >
                <MenuItem sx={{ fontFamily: 'Jost' }} value="week">Past Week</MenuItem>
                <MenuItem sx={{ fontFamily: 'Jost' }} value="month">Past Month</MenuItem>
                <MenuItem sx={{ fontFamily: 'Jost' }} value="year">Past Year</MenuItem>
            </Select>
        </div>

        {/* Averages and This Period Totals */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Averages */}
            <div style={{ flex: 1, padding: "10px" }}>
            <h5 style={{ margin: "0 0 10px 0" }}>Averages</h5>
            <p style={{ fontSize: '0.875rem' }}>Avg Spent: ${avgData.spent.toFixed(2)}</p>
            <p style={{ fontSize: '0.875rem' }}>Avg Earned: ${avgData.earned.toFixed(2)}</p>
            <p style={{ fontSize: '0.875rem' }}>Avg Saved: ${netAvg.toFixed(2)}</p>
            </div>
            {/* This Period Totals */}
            <div style={{ flex: 1, padding: "10px" }}>
            <h5 style={{ margin: "0 0 10px 0" }}>
                This {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </h5>
            <p style={{ fontSize: '0.875rem' }}>Spent: ${periodData.spent.toFixed(2)}</p>
            <p style={{ fontSize: '0.875rem' }}>Earned: ${periodEarned.toFixed(2)}</p>
            <p style={{ fontSize: '0.875rem' }}>Net Saved: ${netPeriod.toFixed(2)}</p>
            </div>
        </div>

        {/* Top Earning and Top Spending Sources */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Top Earning Sources */}
            <div style={{ flex: 1, padding: "10px" }}>
            <h5 style={{ margin: "0 0 10px 0" }}>Top Earning Sources</h5>
            {topSourcesData.topEarning && topSourcesData.topEarning.length > 0 ? (
                <ul style={{ fontSize: '0.875rem',margin: 0, padding: 0, listStyleType: "none" }}>
                {topSourcesData.topEarning.map((source, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>
                    {source.name}: ${source.amount.toFixed(2)}
                    </li>
                ))}
                </ul>
            ) : (
                <p>No data available</p>
            )}
            </div>
            {/* Top Spending Sources */}
            <div style={{ flex: 1, padding: "10px" }}>
            <h5 style={{ margin: "0 0 10px 0" }}>Top Spending Sources</h5>
            {topSourcesData.topSpending && topSourcesData.topSpending.length > 0 ? (
                <ul style={{ fontSize: '0.875rem', margin: 0, padding: 0, listStyleType: "none" }}>
                {topSourcesData.topSpending.map((source, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>
                    {source.name}: ${source.amount.toFixed(2)}
                    </li>
                ))}
                </ul>
            ) : (
                <p>No data available</p>
            )}
            </div>
        </div>
        </Card>
    );
};

export default Breakdown;
