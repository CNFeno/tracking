import { FilePlus2,MonitorPause,FileMinus2,FilePen, Calendar } from 'lucide-react';
import { lineData, todayUpdates, chartData } from '../../data/mockData';
//import SearchBar from '../ui/SearchBar';
import StatsCard from '../ui/StatsCard';
import TodayUpdateCard from '../ui/TodayUpdateCard';
import ChartCard from '../ui/ChartCard';

export default function DashboardContent() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* <SearchBar placeholder="Search order ID..." />
        <button className="bg-blue-800 text-white px-4 py-2 rounded-md flex items-center">
          <Layout className="mr-2" size={16} />
          <span>New Order</span>
        </button> */}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">For global view</p>
        </div>
        <div className="flex items-center">
          <button className="flex items-center bg-white border rounded-md px-4 py-2 text-gray-700">
            <span>Today</span>
            <Calendar className="ml-2" size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Total Updated" 
          value={60} 
          icon={<FilePen className="text-blue-500" size={24} />} 
          data={lineData}
          //lineColor="#4ade80" 
        />
        <StatsCard 
          title="Total Created" 
          value={125} 
          icon={<FilePlus2 className="text-blue-500" size={24} />} 
          data={lineData} 
        />
        <StatsCard 
          title="Total Suspended" 
          value={102} 
          icon={<MonitorPause className="text-blue-500" size={24} />} 
          data={lineData} 
        />
        <StatsCard 
          title="Total Deleted" 
          value={60} 
          icon={<FileMinus2 className="text-blue-500" size={24} />} 
          data={lineData} 
        />
      </div>

      {/* Today's Update and Chart */}
      <div className="grid grid-cols-3 gap-6">
        <TodayUpdateCard updates={todayUpdates} />
        <ChartCard title="Daily added Access" data={chartData} />
      </div>
    </div>
  );
}