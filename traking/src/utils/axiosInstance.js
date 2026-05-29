import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/omit-suivi/accesstrack/api',
  //baseURL: '/omit-suivi/accesstrack/api',
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default instance;
