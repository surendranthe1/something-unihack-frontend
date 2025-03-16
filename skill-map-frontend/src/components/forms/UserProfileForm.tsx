// src/components/forms/UserProfileForm.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Clock, Zap, BookOpen, Video, Headphones, Hand } from 'lucide-react';
import { UserProfile, SkillLevel, LearningStyle } from '../../types';

interface UserProfileFormProps {
  skillName: string;
  onSubmit: (profile: UserProfile) => void;
  loading?: boolean;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ skillName, onSubmit, loading = false }) => {
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(10);
  const [learningStyles, setLearningStyles] = useState<LearningStyle[]>([]);
  const [backgroundKnowledge, setBackgroundKnowledge] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  
  const toggleLearningStyle = (style: LearningStyle) => {
    if (learningStyles.includes(style)) {
      setLearningStyles(learningStyles.filter(s => s !== style));
    } else {
      setLearningStyles([...learningStyles, style]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profile: UserProfile = {
      userId: 'temp-user-id', // In a real app, this would come from auth
      currentSkillLevel: skillLevel,
      learningStylePreferences: learningStyles.length > 0 ? learningStyles : [LearningStyle.VISUAL, LearningStyle.READING],
      timeAvailability: {
        hoursPerWeek,
      },
      backgroundKnowledge: backgroundKnowledge ? backgroundKnowledge.split(',').map(s => s.trim()) : [],
      goals: goals ? goals.split(',').map(s => s.trim()) : [`Learn ${skillName}`],
    };
    
    onSubmit(profile);
  };
  
  return (
    <Card className="max-w-3xl mx-auto bg-black/50 border border-purple-700/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            Tell us about your learning preferences
          </h3>
          <p className="text-purple-200 mt-2">
            Customize your <span className="text-white font-semibold">{skillName}</span> learning journey
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Current {skillName} Skill Level
                </label>
                <Select
                  value={skillLevel}
                  onValueChange={(value) => setSkillLevel(value as SkillLevel)}
                >
                  <SelectTrigger className="bg-black/60 border-purple-700/50 text-white">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-purple-700 text-white">
                    <SelectItem value={SkillLevel.BEGINNER}>Beginner</SelectItem>
                    <SelectItem value={SkillLevel.INTERMEDIATE}>Intermediate</SelectItem>
                    <SelectItem value={SkillLevel.ADVANCED}>Advanced</SelectItem>
                    <SelectItem value={SkillLevel.EXPERT}>Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Available Hours per Day
                </label>
                <div className="flex items-center gap-4">
                  <Clock className="text-purple-400 h-5 w-5" />
                  <Slider
                    value={[hoursPerWeek]}
                    onValueChange={(value) => setHoursPerWeek(value[0])}
                    max={24}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-white min-w-8 text-center">{hoursPerWeek}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Learning Style Preferences
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  type="button"
                  variant={learningStyles.includes(LearningStyle.READING) ? "default" : "outline"}
                  onClick={() => toggleLearningStyle(LearningStyle.READING)}
                  className={`flex items-center gap-2 ${
                    learningStyles.includes(LearningStyle.READING)
                      ? "bg-purple-700"
                      : "border-purple-700/50 bg-black/50 hover:bg-purple-900/30"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Reading</span>
                </Button>
                <Button
                  type="button"
                  variant={learningStyles.includes(LearningStyle.VISUAL) ? "default" : "outline"}
                  onClick={() => toggleLearningStyle(LearningStyle.VISUAL)}
                  className={`flex items-center gap-2 ${
                    learningStyles.includes(LearningStyle.VISUAL)
                      ? "bg-purple-700"
                      : "border-purple-700/50 bg-black/50 hover:bg-purple-900/30"
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>Visual</span>
                </Button>
                <Button
                  type="button"
                  variant={learningStyles.includes(LearningStyle.AUDITORY) ? "default" : "outline"}
                  onClick={() => toggleLearningStyle(LearningStyle.AUDITORY)}
                  className={`flex items-center gap-2 ${
                    learningStyles.includes(LearningStyle.AUDITORY)
                      ? "bg-purple-700"
                      : "border-purple-700/50 bg-black/50 hover:bg-purple-900/30"
                  }`}
                >
                  <Headphones className="h-4 w-4" />
                  <span>Auditory</span>
                </Button>
                <Button
                  type="button"
                  variant={learningStyles.includes(LearningStyle.KINESTHETIC) ? "default" : "outline"}
                  onClick={() => toggleLearningStyle(LearningStyle.KINESTHETIC)}
                  className={`flex items-center gap-2 ${
                    learningStyles.includes(LearningStyle.KINESTHETIC)
                      ? "bg-purple-700"
                      : "border-purple-700/50 bg-black/50 hover:bg-purple-900/30"
                  }`}
                >
                  <Hand className="h-4 w-4" />
                  <span>Hands-on</span>
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Background Knowledge
              </label>
              <Input
                type="text"
                value={backgroundKnowledge}
                onChange={(e) => setBackgroundKnowledge(e.target.value)}
                placeholder="e.g. Python basics, web development (comma separated)"
                className="bg-black/60 border-purple-700/50 text-white"
              />
              <p className="text-purple-200 text-xs mt-1">
                List any relevant skills or knowledge you already have (separate with commas)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-300 mb-2">
                Learning Goals (Optional)
              </label>
              <Input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Build a portfolio project, get a job in the field"
                className="bg-black/60 border-purple-700/50 text-white"
              />
            </div>
            
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Zap className="mr-2 h-5 w-5" />
                )}
                Generate Learning Path
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;