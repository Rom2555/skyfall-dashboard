"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface ChartDataPoint {
  date: string;
  spend: number;
  revenue: number;
}

export function SpendRevenueChart({ data }: { data: ChartDataPoint[] }) {
  // Reverse data (from DB it comes newest first, but chart draws left to right)
  const chartData = [...data].reverse().map(item => {
    // Handle both Date objects and string dates
    const dateValue = item.date;
    let formattedDate = 'N/A';
    
    if (dateValue) {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    }
    
    return {
      date: formattedDate,
      spend: Number(item.spend) || 0,
      revenue: Number(item.revenue) || 0,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-400">
        No historical data available for this campaign
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpendChart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorRevenueChart" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <Tooltip
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
          }}
          itemStyle={{ fontSize: '14px', fontWeight: 500 }}
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`, 
            name === 'spend' ? 'Spend' : 'Revenue'
          ]}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => value === 'spend' ? 'Spend' : 'Revenue'}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorSpendChart)"
          strokeWidth={2}
          activeDot={{ r: 5 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#22c55e"
          fillOpacity={1}
          fill="url(#colorRevenueChart)"
          strokeWidth={2}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
