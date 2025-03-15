// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Adjust to your backend URL

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;