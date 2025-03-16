// src/components/skill-program/DailyTaskView.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, BarChart } from 'lucide-react';
import { DailyTask, SkillProgram, TaskProgressData } from '../../types';
import DailyTaskPanel from './DailyTaskPanel';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useSkillContext } from '../../context/SkillContext';
import skillProgramService from '../../services/skillProgramService';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

interface DailyTaskViewProps {
  skillProgram: SkillProgram;
}

const DailyTaskView: React.FC<DailyTaskViewProps> = ({ skillProgram }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [currentTask, setCurrentTask] = useState<DailyTask | null>(null);
  const [updating, setUpdating] = useState(false);
  const { skillProgram: contextProgram, setSkillProgram } = useSkillContext();
  const { userProfile } = useContext(UserContext);
  
  // Calculate overall progress
  const completedTasks = skillProgram.dailyTasks.filter(task => task.status === 'completed').length;
  const overallProgress = Math.round((completedTasks / 30) * 100);
  
  // Get current date and program start date
  const today = new Date();
  const programStart = new Date(today);
  programStart.setDate(today.getDate() - (currentDay - 1));
  
  useEffect(() => {
    // Find the current task
    const task = skillProgram.dailyTasks.find(task => task.day === currentDay) || null;
    setCurrentTask(task);
  }, [currentDay, skillProgram.dailyTasks]);
  
  // Go to previous day
  const goToPrevious = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };
  
  // Go to next day
  const goToNext = () => {
    if (currentDay < 30) {
      setCurrentDay(currentDay + 1);
    }
  };
  
  // Mark task as complete or in progress
  const handleMarkComplete = async (day: number) => {
    if (!currentTask || !userProfile?.userId) return;
    
    setUpdating(true);
    
    try {
      // Toggle status
      const newStatus = currentTask.status === 'completed' ? 'in_progress' : 'completed';
      const completionPercentage = newStatus === 'completed' ? 100 : 50;
      
      // Create progress data
      const progressData: TaskProgressData = {
        day,
        completionPercentage,
        timeSpent: currentTask.estimatedHours, // Assuming they spent the estimated time
        notes: `Marked as ${newStatus}`
      };
      
      // Update locally first for immediate feedback
      const updatedTasks = [...skillProgram.dailyTasks];
      const taskIndex = updatedTasks.findIndex(task => task.day === day);
      
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: newStatus,
          progress: completionPercentage
        };
        
        const updatedProgram = {
          ...skillProgram,
          dailyTasks: updatedTasks
        };
        
        setSkillProgram(updatedProgram);
        
        // Call API to update in backend
        await skillProgramService.updateTaskProgress(
          skillProgram.id,
          userProfile.userId,
          [progressData]
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert to original status on error
      const originalStatus = currentTask.status;
      
      const updatedTasks = [...skillProgram.dailyTasks];
      const taskIndex = updatedTasks.findIndex(task => task.day === day);
      
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: originalStatus,
          progress: originalStatus === 'completed' ? 100 : originalStatus === 'in_progress' ? 50 : 0
        };
        
        setSkillProgram({
          ...skillProgram,
          dailyTasks: updatedTasks
        });
      }
    } finally {
      setUpdating(false);
    }
  };
  
  // Find tasks by status
  const completedTaskCount = skillProgram.dailyTasks.filter(task => task.status === 'completed').length;
  const inProgressTaskCount = skillProgram.dailyTasks.filter(task => task.status === 'in_progress').length;
  const notStartedTaskCount = skillProgram.dailyTasks.filter(task => task.status === 'not_started').length;
  
  return (
    <div className="bg-black/30 border border-purple-700/30 rounded-lg overflow-hidden">
      {/* Header with progress overview */}
      <div className="p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-700/30">
        <h2 className="text-2xl font-bold text-white mb-3">{skillProgram.skillName}</h2>
        <p className="text-purple-200 mb-4">{skillProgram.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-black/30 p-3 rounded-lg border border-purple-700/20">
            <div className="text-sm text-purple-300">Total Days</div>
            <div className="text-white text-xl font-bold">30</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-purple-700/20">
            <div className="text-sm text-purple-300">Completed</div>
            <div className="text-green-400 text-xl font-bold">{completedTaskCount}</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-purple-700/20">
            <div className="text-sm text-purple-300">In Progress</div>
            <div className="text-blue-400 text-xl font-bold">{inProgressTaskCount}</div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-purple-700/20">
            <div className="text-sm text-purple-300">Not Started</div>
            <div className="text-purple-400 text-xl font-bold">{notStartedTaskCount}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-purple-200">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>
      
      {/* Calendar navigation */}
      <div className="flex justify-between items-center p-4 bg-black/50 border-b border-purple-700/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          disabled={currentDay === 1}
          className="text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center text-white">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="font-medium">Day {currentDay} of 30</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          disabled={currentDay === 30}
          className="text-white"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Task Detail */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentTask && (
            <motion.div
              key={currentTask.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DailyTaskPanel 
                task={currentTask} 
                onMarkComplete={handleMarkComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer with quick navigation */}
      <div className="px-6 py-4 bg-black/30 border-t border-purple-700/30">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {skillProgram.dailyTasks.map((task) => (
            <button
              key={task.day}
              onClick={() => setCurrentDay(task.day)}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                currentDay === task.day
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-purple-900'
                  : ''
              } ${
                task.status === 'completed'
                  ? 'bg-green-600'
                  : task.status === 'in_progress'
                  ? 'bg-blue-600'
                  : 'bg-purple-800/60'
              }`}
            >
              <span className="text-white text-xs">{task.day}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyTaskView;