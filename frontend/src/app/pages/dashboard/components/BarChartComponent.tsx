'use client';

import Card from '../../../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Jan', spent: 900, earned: 1200 },
  { month: 'Feb', spent: 700, earned: 1500 },
  { month: 'Mar', spent: 800, earned: 1100 },
  { month: 'Apr', spent: 500, earned: 1200 },
  { month: 'May', spent: 950, earned: 1250 },
  { month: 'Jun', spent: 400, earned: 1400 },
  { month: 'Jul', spent: 750, earned: 1600 },
  { month: 'Aug', spent: 600, earned: 1300 },
  { month: 'Sep', spent: 1000, earned: 1700 },
  { month: 'Oct', spent: 300, earned: 1100 },
  { month: 'Nov', spent: 450, earned: 1050 },
  { month: 'Dec', spent: 500, earned: 1200 },
];

const BarChartComponent = () => {
  return (
    <Card>
      <h4 style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: 15 }}>
        2025 Summary
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="spent" fill="var(--negative)" />
          <Bar dataKey="earned" fill="var(--positive)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BarChartComponent;
