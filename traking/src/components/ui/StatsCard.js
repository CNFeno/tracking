import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function StatsCard({ title, value, icon, data, lineColor }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
      <div className="flex justify-between mb-4">
        {icon}
        <div className="h-16 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={lineColor || "#3b82f6"} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}