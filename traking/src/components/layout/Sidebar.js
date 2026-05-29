import { ListPlus, ChartArea, Users, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const email = localStorage.getItem('email') || 'admin@yas.mg';
  const profilePhoto = localStorage.getItem('profilePhoto');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white shadow-sm relative flex flex-col justify-between">
      <div>
        <div className="p-4 flex items-center">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="w-8 h-8" />
          <span className="ml-2 text-xl font-bold text-gray-800">Tracking</span>
        </div>

        <div className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Management</div>

          <Link
            to="/dashboard"
            className={`flex items-center w-full px-4 py-3 ${
              location.pathname === '/dashboard' ? 'bg-blue-800 text-white' : 'text-gray-700'
            }`}
          >
            <ChartArea className="mr-3" size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/access"
            className={`flex items-center w-full px-4 py-3 ${
              location.pathname.startsWith('/access') ? 'bg-blue-800 text-white' : 'text-gray-700'
            }`}
          >
            <ListPlus className="mr-3" size={20} />
            <span>Access Management</span>
          </Link>

          <div className="mt-6 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Administration</div>

          <Link
            to="/users"
            className={`flex items-center w-full px-4 py-3 ${
              location.pathname.startsWith('/users') ? 'bg-blue-800 text-white' : 'text-gray-700'
            }`}
          >
            <Users className="mr-3" size={20} />
            <span>Users</span>
          </Link>

          <Link
            to="/setting"
            className={`flex items-center w-full px-4 py-3 ${
              location.pathname.startsWith('/setting') ? 'bg-blue-800 text-white' : 'text-gray-700'
            }`}
          >
            <Settings className="mr-3" size={20} />
            <span>Setting</span>
          </Link>
        </div>
      </div>

      {/* Footer avec infos utilisateur et logout */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-sm">👤</span>
            )}
          </div>
          <div className="ml-2">
            <div className="text-sm font-semibold">{userId || 'Utilisateur'}</div>
            <div className="text-xs text-gray-500">{email}</div>
          </div>
        </div>
        <button onClick={handleLogout} title="To deconnect">
          <LogOut className="text-gray-500 hover:text-red-600" size={20} />
        </button>
      </div>
    </div>
  );
}
