'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryStats } from '@/types/analytics.types';

interface CategoryBarChartProps {
  categories: CategoryStats[];
  maxCategories?: number;
}

export default function CategoryBarChart({ categories, maxCategories = 10 }: CategoryBarChartProps) {
  // Sort by count and take top N
  const topCategories = [...categories]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxCategories);

  // Format data for Recharts
  const chartData = topCategories.map((cat) => ({
    name: cat.name.length > 20 ? cat.name.substring(0, 20) + '...' : cat.name,
    fullName: cat.name,
    count: cat.count,
    percentage: cat.percentage,
  }));

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Top Categories</h2>
        <p className="text-sm text-gray-500 mt-1">
          Distribution of annotations across categories (top {maxCategories})
        </p>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#6b7280"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                      <div className="font-semibold">{data.fullName}</div>
                      <div>Count: {data.count}</div>
                      <div>Percentage: {data.percentage.toFixed(1)}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
