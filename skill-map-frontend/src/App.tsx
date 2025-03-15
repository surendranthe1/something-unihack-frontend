// src/App.tsx
import HomePage from './pages/HomePage';
import { UserProvider } from './context/UserContext';
import { SkillProvider } from './context/SkillContext';

function App() {
  return (
    <UserProvider>
      <SkillProvider>
        <div className="app">
          <HomePage />
        </div>
      </SkillProvider>
    </UserProvider>
  );
}

export default App;