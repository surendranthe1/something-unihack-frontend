// src/config/app.ts
import env from './env';

// Initialize the application
const initializeApp = () => {
  // Log environment information in development
  if (env.IS_DEV) {
    console.log('Running in development mode');
    console.log('API URL:', env.API_URL);
    console.log('Mocks enabled:', env.ENABLE_MOCKS);
  }
  
  // Add any global initialization code here
  
  // Register global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You could send this to an error tracking service like Sentry
  });
  
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You could send this to an error tracking service like Sentry
  });
};

export default { initializeApp };