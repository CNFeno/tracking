import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';

export default function ChartCard({ title, data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <select className="border rounded-md px-3 py-1 text-sm">
            <option>Week</option>
            <option>Month</option>
            <option>Year</option>
          </select>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Bar dataKey="value" fill="#f5cb5c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}