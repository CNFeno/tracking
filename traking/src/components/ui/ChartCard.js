import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import axios from '../../utils/axiosInstance';

export default function ChartCard({ title }) {
  const [period, setPeriod] = useState('week');
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await axios.get(`/dashboard/chart?period=${period}`);
        const formattedData = res.data.map(item => ({
          name: item.day,
          value: item.count
        }));
        setData(formattedData);
      } catch (err) {
        console.error("Erreur de chargement du graphique :", err);
      }
    };

    fetchChart();
  }, [period]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-1 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
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
