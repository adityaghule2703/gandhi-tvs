import axios from 'axios';

axios.defaults.withCredentials = true;
const config = {
  //baseURL: import.meta.env.VITE_API_BASE_URL

  // baseURL: 'http://localhost:3002/api/v1'

  //baseURL: 'https://dealership.gandhitvs.in/api/v1'

  baseURL: 'http://localhost:5000/api/v1'
};

export default config;
