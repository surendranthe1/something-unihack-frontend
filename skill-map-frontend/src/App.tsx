// src/App.tsx
import HomePage from './pages/HomePage';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <div className="app">
        <HomePage />
      </div>
    </UserProvider>
  );
}

export default App;