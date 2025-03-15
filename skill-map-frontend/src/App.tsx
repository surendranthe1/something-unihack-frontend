// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard';
import { UserProvider } from './context/UserContext';
import { SkillProvider } from './context/SkillContext';

function App() {
  return (
    <Router>
      <UserProvider>
        <SkillProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SkillProvider>
      </UserProvider>
    </Router>
  );
}

export default App;