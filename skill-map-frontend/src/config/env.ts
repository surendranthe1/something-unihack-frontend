// src/config/env.ts

// Environment configurations
const env = {
    development: {
      API_URL: 'http://localhost:8080/api',
      ENABLE_MOCKS: false, // Set to true to use mock data instead of real API
      API_TIMEOUT: 1000000000, // 30 seconds
    },
    production: {
      API_URL: '/api', // Assumes API is served from the same domain in production
      ENABLE_MOCKS: false,
      API_TIMEOUT: 1000000000, // 60 seconds
    },
    test: {
      API_URL: 'http://localhost:8080/api',
      ENABLE_MOCKS: true, // Always use mocks in test environment
      API_TIMEOUT: 1000000000, // 5 seconds
    },
  };
  
  // Determine current environment
  const getEnvironment = () => {
    if (import.meta.env) {
      // Vite specific environment variables
      return import.meta.env.MODE || 'development';
    } else if (process.env.NODE_ENV) {
      // React/Create React App environment variables
      return process.env.NODE_ENV;
    }
    return 'development';
  };
  
  // Get current environment config
  const currentEnv = getEnvironment();
  const config = env[currentEnv as keyof typeof env] || env.development;
  
  // Export config with type safety
  export default {
    API_URL: config.API_URL,
    ENABLE_MOCKS: config.ENABLE_MOCKS,
    API_TIMEOUT: config.API_TIMEOUT,
    IS_DEV: currentEnv === 'development',
    IS_PROD: currentEnv === 'production',
    IS_TEST: currentEnv === 'test',
  };