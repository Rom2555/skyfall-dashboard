"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export function OverviewChart({ data }: { data: any[] }) {
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
      clicks: Number(item.clicks) || 0,
    };
  });

  if (chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-400">No chart data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
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
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#1e293b', fontSize: '14px', fontWeight: 500 }}
            formatter={(value: number | undefined) => [`$${value ?? 0}`, 'Spend']}
        />
        <Area
          type="monotone"
          dataKey="spend"
          stroke="#0f172a"
          fillOpacity={1}
          fill="url(#colorSpend)"
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}