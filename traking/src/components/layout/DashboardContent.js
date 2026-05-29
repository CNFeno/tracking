import { FilePlus2, MonitorPause, FileMinus2, FilePen, Calendar, Phone, Wifi, DollarSign, CheckSquare, Truck, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance'; // avec gestion du token
import StatsCard from '../ui/StatsCard';
import TodayUpdateCard from '../ui/TodayUpdateCard';
import ChartCard from '../ui/ChartCard';
import { lineData } from '../../data/mockData';

const iconMap = {
  VOCALCOM: <Phone size={16} />,
  RBS: <Wifi size={16} />,
  UTIBA_2TMV: <DollarSign size={16} />,
  LYNX: <CheckSquare size={16} />,
  LOGICAR: <Truck size={16} />,
  SIMS: <FileText size={16} />
};

export default function DashboardContent() {
  const [stats, setStats] = useState({
    updated: 0,
    created: 0,
    suspended: 0,
    deleted: 0
  });

  const [todayUpdates, setTodayUpdates] = useState([]);
  //const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats'); // tu dois créer cette route
        setStats(res.data);
      } catch (err) {
        console.error("Erreur de chargement des stats du dashboard :", err);
      }
    };

    const fetchUpdates = async () => {
      try {
        const res = await axios.get('/dashboard/today-updates');
        const enriched = res.data.map(item => ({
          name: item.platform,
          value: item.count,
          icon: iconMap[item.platform] || <FileText size={16} />
        }));
        //console.log("Today updates:", enriched);
        setTodayUpdates(enriched);
      } catch (err) {
        console.error("Erreur de chargement des updates :", err);
      }
    };

    fetchStats();
    fetchUpdates();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">For global view</p>
        </div>
        <button className="flex items-center bg-white border rounded-md px-4 py-2 text-gray-700">
          <span>Today</span>
          <Calendar className="ml-2" size={16} />
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Updated"
          value={stats.updated}
          icon={<FilePen className="text-blue-500" size={24} />}
          data={lineData}
        />
        <StatsCard
          title="Total Created"
          value={stats.created}
          icon={<FilePlus2 className="text-blue-500" size={24} />}
          data={lineData}
        />
        <StatsCard
          title="Total Suspended"
          value={stats.suspended}
          icon={<MonitorPause className="text-blue-500" size={24} />}
          data={lineData}
        />
        <StatsCard
          title="Total Deleted"
          value={stats.deleted}
          icon={<FileMinus2 className="text-blue-500" size={24} />}
          data={lineData}
        />
      </div>

      {/* Updates et graph */}
      <div className="grid grid-cols-3 gap-6">
        <TodayUpdateCard updates={todayUpdates} />
        <ChartCard title="Access Registered" />
      </div>
    </div>
  );
}
