'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CSVRow } from '@/types/csv.types';
import { COLORS } from '@/constants/colors';

interface PolicyDonutChartProps {
  data: CSVRow[];
}

export default function PolicyDonutChart({ data }: PolicyDonutChartProps) {
  // Aggregate by RAI Policy Type
  const policyMap = new Map<string, number>();
  
  data.forEach((row) => {
    const policyType = row['Targeted RAI Policy (Task Type)']?.trim();
    if (policyType) {
      policyMap.set(policyType, (policyMap.get(policyType) || 0) + 1);
    }
  });

  // Format for Recharts
  const chartData = Array.from(policyMap.entries())
    .map(([name, count]) => ({
      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
      fullName: name,
      value: count,
      percentage: (count / data.length) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">RAI Policy Distribution</h2>
        <p className="text-sm text-gray-500 mt-1">
          Coverage across targeted RAI policy types
        </p>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={140}
              paddingAngle={2}
              dataKey="value"
              label={(entry) => `${entry.percentage.toFixed(1)}%`}
              labelLine={{ stroke: '#6b7280' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
                      <div className="font-semibold mb-1">{data.fullName}</div>
                      <div>Count: {data.value}</div>
                      <div>Percentage: {data.percentage.toFixed(1)}%</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: any) => {
                const data = entry.payload;
                return `${data.name} (${data.value})`;
              }}
              wrapperStyle={{ fontSize: '12px', maxWidth: '200px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
