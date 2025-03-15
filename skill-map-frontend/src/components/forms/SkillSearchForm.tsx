// src/components/forms/SkillSearchForm.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Brain } from 'lucide-react';

interface SkillSearchFormProps {
  onSearch: (skillName: string) => void;
  loading?: boolean;
}

const SkillSearchForm: React.FC<SkillSearchFormProps> = ({ onSearch, loading = false }) => {
  const [skillName, setSkillName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async () => {
    if (!skillName) {
      setError("Please enter a skill you want to learn");
      return;
    }
    
    setError(null);
    onSearch(skillName);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="text-center">
      <div className="mb-12">
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 py-6">
          What skill would you like to master?
        </h2>
        <p className="text-lg text-purple-200 max-w-2xl mx-auto">
          Enter the skill you want to learn, and we'll create a personalized learning path for you
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-4">
          <Input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Machine Learning, Web Development, Data Science"
            className="bg-black/60 border-purple-700/50 text-white py-6"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !skillName}
            className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
            ) : (
              <Brain className="mr-2 h-5 w-5" />
            )}
            Continue
          </Button>
        </div>
        
        {error && (
          <div className="mt-4 text-red-500 bg-red-950/20 p-3 rounded-md border border-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSearchForm;