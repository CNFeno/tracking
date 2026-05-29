import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const IdleLogout = ({ timeout = 15 * 60 * 1000 }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('profilePhoto');
        navigate('/login');
      }, timeout);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // Démarre le timer au montage

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [navigate, timeout]);

  return null;
};

export default IdleLogout;
