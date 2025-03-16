// src/components/skill-program/DailyTaskPanel.tsx
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  Activity, BookOpen, Video, Clock, CheckCircle, Circle, Info, 
  Code, FileText, Lightbulb, Bookmark, Award, Brain, Target,
  GraduationCap, Wrench, Link, Youtube, Music, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { DailyTask } from '../../types';
import { Progress } from '../ui/progress';

interface DailyTaskPanelProps {
  task: DailyTask;
  onMarkComplete?: (taskDay: number) => void;
  onNavigate?: (day: number) => void;
  totalDays?: number;
}

const DailyTaskPanel: React.FC<DailyTaskPanelProps> = ({ 
  task, 
  onMarkComplete, 
  onNavigate,
  totalDays = 30 
}) => {
  // Determine status icon and color
  const getStatusInfo = () => {
    switch (task.status) {
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-pink-500 text-white' };
      case 'in_progress':
        return { icon: <Activity className="h-4 w-4" />, color: 'bg-yellow-500 text-white' };
      default:
        return { icon: <Circle className="h-4 w-4" />, color: 'bg-gray-500 text-white' };
    }
  };
  
  // Get icon based on resource type
  const getResourceIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('video')) return <Video className="h-4 w-4 text-white" />;
    if (lowerType.includes('article')) return <FileText className="h-4 w-4 text-white" />;
    if (lowerType.includes('exercise') || lowerType.includes('practice')) return <Code className="h-4 w-4 text-white" />;
    if (lowerType.includes('tutorial')) return <Lightbulb className="h-4 w-4 text-white" />;
    if (lowerType.includes('book')) return <Bookmark className="h-4 w-4 text-white" />;
    if (lowerType.includes('course')) return <GraduationCap className="h-4 w-4 text-white" />;
    if (lowerType.includes('tool')) return <Wrench className="h-4 w-4 text-white" />;
    if (lowerType.includes('website')) return <Link className="h-4 w-4 text-white" />;
    if (lowerType.includes('youtube')) return <Youtube className="h-4 w-4 text-white" />;
    if (lowerType.includes('audio')) return <Music className="h-4 w-4 text-white" />;
    if (lowerType.includes('project')) return <Target className="h-4 w-4 text-white" />;
    return <BookOpen className="h-4 w-4 text-white" />;
  };
  
  const statusInfo = getStatusInfo();
  
  // Get color class based on difficulty level
  const getDifficultyColor = () => {
    switch (task.difficultyLevel.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-600 text-white';
      case 'intermediate':
        return 'bg-blue-600 text-white';
      case 'advanced':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };
  
  // Handle task completion toggle
  const handleComplete = () => {
    if (onMarkComplete) {
      onMarkComplete(task.day);
    }
  };
  
  // Navigate to previous or next day
  const navigateToPrevious = () => {
    if (onNavigate && task.day > 1) {
      onNavigate(task.day - 1);
    }
  };
  
  const navigateToNext = () => {
    if (onNavigate && task.day < totalDays) {
      onNavigate(task.day + 1);
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = task.status === 'completed' ? 100 : 
                            task.status === 'in_progress' ? 50 : 0;
  
  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateToPrevious}
          disabled={task.day <= 1}
          className={task.day <= 1 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <Badge className="bg-gray-700">
          {task.day} / {totalDays}
        </Badge>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={navigateToNext}
          disabled={task.day >= totalDays}
          className={task.day >= totalDays ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Header with gradient background */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Badge className={statusInfo.color}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {task.status === 'not_started' && 'Not Started'}
              {task.status === 'in_progress' && 'In Progress'}
              {task.status === 'completed' && 'Completed'}
            </div>
          </Badge>
          <Badge className={getDifficultyColor()}>
            {task.difficultyLevel}
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-white mb-3">{task.name}</h2>
        <Progress value={progressPercentage} className="h-2 mb-2" />
      </div>
      
      {/* Task Description - Using full description from JSON */}
      <div className="bg-black/40 p-4 rounded-lg border border-purple-700/30">
        <h3 className="text-lg font-medium text-purple-200 mb-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          <span>Task Description</span>
        </h3>
        <p className="text-white text-sm whitespace-pre-line leading-relaxed">
          {task.description}
        </p>
      </div>
      
      {/* Time estimate */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-purple-700/20">
        <Clock className="h-5 w-5 text-purple-400" />
        <div>
          <div className="text-sm text-purple-300">Estimated Time</div>
          <div className="text-white font-bold">{task.estimatedHours} hours</div>
        </div>
      </div>
      
      {/* Recommended Resources - More detailed view */}
      {task.resources && task.resources.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-purple-200 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Learning Resources</span>
          </h3>
          <Separator className="my-2 bg-purple-700/30" />
          <ul className="space-y-3 mt-3">
            {task.resources.map((resource, index) => (
              <li key={index} className="bg-black/40 p-3 rounded-lg border border-purple-700/30 hover:border-purple-500/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mt-1">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-base font-medium mb-1">{resource.name}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-purple-900/20 text-purple-200 border-purple-700/30 text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    {resource.description && (
                      <div className="text-purple-200 text-sm mb-2">{resource.description}</div>
                    )}
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 text-sm hover:text-blue-300 mt-1 transition-colors"
                      >
                        <Link className="h-3 w-3" />
                        Visit resource
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Difficulty level details */}
      <div>
        <h3 className="text-lg font-medium text-purple-200 mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <span>Difficulty Level</span>
        </h3>
        <Separator className="my-2 bg-purple-700/30" />
        <div className="bg-black/40 p-4 rounded-lg border border-purple-700/30 mt-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${
              task.difficultyLevel.toLowerCase() === 'beginner' ? 'bg-gradient-to-r from-emerald-500 to-emerald-700' :
              task.difficultyLevel.toLowerCase() === 'intermediate' ? 'bg-gradient-to-r from-blue-500 to-blue-700' :
              'bg-gradient-to-r from-purple-500 to-purple-700'
            } flex items-center justify-center`}>
              <Badge className="bg-black/30 border-none">
                {task.difficultyLevel.charAt(0).toUpperCase()}
              </Badge>
            </div>
            <div>
              <div className="text-white font-medium">{task.difficultyLevel} Level</div>
              <div className="text-purple-200 text-sm">Task {task.day}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="pt-4">
        {task.status !== 'completed' ? (
          <Button 
            className="w-full bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900"
            onClick={handleComplete}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark as Completed
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900"
            onClick={handleComplete}
          >
            <Activity className="h-5 w-5 mr-2" />
            Mark as In Progress
          </Button>
        )}
      </div>
      
      {/* Navigation buttons footer */}
      <div className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPrevious}
          disabled={task.day <= 1}
          className={`flex-1 mr-2 ${task.day <= 1 ? 'opacity-50' : 'hover:bg-purple-900/20'}`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous Day
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToNext}
          disabled={task.day >= totalDays}
          className={`flex-1 ml-2 ${task.day >= totalDays ? 'opacity-50' : 'hover:bg-purple-900/20'}`}
        >
          Next Day
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default DailyTaskPanel;