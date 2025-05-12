require('dotenv').config();
const axios = require('axios');
const { getAuthToken } = require('./authService');

const client = axios.create({
  baseURL: 'http://20.244.56.144/evaluation-service/',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(async (config) => {
  try {
    const token = await getAuthToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  } catch (error) {
    console.error('Auth token error:', error.message);
    return Promise.reject(error);
  }
});

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        params: error.config.params
      });
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

module.exports = client;
