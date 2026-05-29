import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
//import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // ✅ Import correct (sans les accolades)
import axios from '../../utils/axiosInstance';

export default function LoginForm() {
  const [userId, setuserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/login', {
        userId,
        password
      });

      const token = res.data.access_token;
      const decoded = jwtDecode(token); // ✅ decode après réception

      console.log('🧾 Token décodé :', decoded);

      // Enregistrement dans le localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('utilisateur_id', decoded.sub);
      localStorage.setItem('userId', decoded.userId);
      localStorage.setItem('email', decoded.email || '');
      localStorage.setItem('userRole', decoded.role || '');
      if (res.data.user?.profile_photo) {
        localStorage.setItem('profilePhoto', res.data.user.profile_photo);
      } else {
        localStorage.removeItem('profilePhoto');
      }

      setIsLoggedIn(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }

    //console.log('userId:', userId, 'Password:', password);
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, from, navigate]);

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-blue-900 flex items-center justify-center p-10">
        <img src={`${process.env.PUBLIC_URL}/illustration-login.png`} alt="Illustration" className="max-w-full h-auto" />
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-10">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Yas Logo" className="w-24 mx-auto mb-4" />
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-2">
            Welcome to Access Tracking
          </h2>
          <p className="text-center text-gray-600 mb-8">Login on your account.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setuserId(e.target.value)}
                placeholder="Enter userId"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-800 text-white rounded-full py-2 hover:bg-blue-700 transition"
            >
              Connect
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
