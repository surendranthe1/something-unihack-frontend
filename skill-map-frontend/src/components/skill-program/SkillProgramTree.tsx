// src/components/skill-program/SkillProgramTree.tsx
import React, { useState, useEffect, useRef } from 'react';
import DailyTaskPath from './DailyTaskPath';
import DailyTaskPanel from './DailyTaskPanel';
import { SkillProgram, DailyTask } from '../../types';
import { Minimize2, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';
import { useSkillContext } from '../../context/SkillContext';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import skillProgramService from '../../services/skillProgramService';

interface SkillProgramTreeProps {
  skillProgram: SkillProgram;
}

const SkillProgramTree: React.FC<SkillProgramTreeProps> = ({ skillProgram }) => {
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [currentDay, setCurrentDay] = useState<number | undefined>(undefined);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [updating, setUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSkillProgram } = useSkillContext();
  const { userProfile } = useContext(UserContext);
  
  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // When a task is clicked, open the panel
  const handleTaskClick = (task: DailyTask) => {
    setSelectedTask(task);
    setCurrentDay(task.day);
    setIsPanelOpen(true);
  };
  
  // Close the panel
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };
  
  // Navigate to a different day
  const handleNavigateDay = (day: number) => {
    // Find the task for the specified day
    const nextTask = skillProgram.dailyTasks.find(task => task.day === day);
    if (nextTask) {
      setSelectedTask(nextTask);
      setCurrentDay(day);
    }
  };
  
  // Mark task as complete or in progress
  const handleMarkComplete = async (day: number) => {
    if (!selectedTask || !userProfile?.userId) return;
    
    setUpdating(true);
    
    try {
      // Toggle status
      const newStatus = selectedTask.status === 'completed' ? 'in_progress' : 'completed';
      const completionPercentage = newStatus === 'completed' ? 100 : 50;
      
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
        setSelectedTask(updatedTasks[taskIndex]);
        
        // Call API to update in backend
        await skillProgramService.updateTaskProgress(
          skillProgram.id,
          userProfile.userId,
          [{
            day,
            completionPercentage,
            timeSpent: selectedTask.estimatedHours, // Assuming they spent the estimated time
            notes: `Marked as ${newStatus}`
          }]
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert to original status on error
      const originalStatus = selectedTask.status;
      
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
        setSelectedTask(updatedTasks[taskIndex]);
      }
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div ref={containerRef} className="bg-black/30 border border-purple-700/30 rounded-lg p-4 relative overflow-hidden">
      <div className="flex h-full">
        {/* Main container for both tree and panel */}
        <div className="w-full flex flex-col md:flex-row relative">
          {/* Skill Tree with hidden scrollbars - height increased */}
          <div 
            className={`${isPanelOpen ? 'md:w-2/3 lg:w-3/4' : 'w-full'} transition-all duration-300 ease-in-out`} 
            style={{ 
              height: '90vh', // Increased height
              overflow: 'hidden'
            }}
          >
            <div className={`${isPanelOpen ? 'pr-4' : ''} h-full`} style={{ height: '90vh' }}>
              <DailyTaskPath 
                skillProgram={skillProgram} 
                onTaskClick={handleTaskClick} 
                currentDay={currentDay}
              />
            </div>
          </div>
          
          {/* Detail Panel for desktop - increased panel width and height */}
          <AnimatePresence>
            {isPanelOpen && selectedTask && !isMobile && (
              <motion.div 
                className="hidden md:block md:w-1/3 lg:w-1/4 overflow-y-auto hide-scrollbar"
                style={{ 
                  maxHeight: '90vh', // Increased height
                  height: '90vh',
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none' 
                }}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Styles for hiding scrollbars are now in the global CSS */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/90 to-black/90 backdrop-blur-sm border-b border-purple-700/30 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      {selectedTask.day}
                    </span>
                    Task Details
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleClosePanel}
                    className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                  >
                    <Minimize2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="p-4 pb-36"> {/* Added extra bottom padding */}
                  <DailyTaskPanel 
                    task={selectedTask} 
                    onMarkComplete={handleMarkComplete}
                    onNavigate={handleNavigateDay}
                    totalDays={skillProgram.dailyTasks.length}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile Layout */}
      {isMobile && (
        <Sheet open={isPanelOpen && isMobile} onOpenChange={setIsPanelOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 border-t border-purple-700/50 bg-black/95">
            <SheetHeader className="bg-gradient-to-r from-purple-900/90 to-black/90 p-3 border-b border-purple-700/30">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClosePanel}
                  className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                >
                  <ArrowLeft className="h-4 w-4 text-white" />
                </Button>
                <SheetTitle className="text-white">Task Details</SheetTitle>
                <div className="w-8"></div> {/* Empty div for centering */}
              </div>
            </SheetHeader>
            <div className="p-4 pb-36 hide-scrollbar" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', height: 'calc(90vh - 60px)' }}>
              {/* Styles for hiding scrollbars are now in the global CSS */}
              {selectedTask && (
                <DailyTaskPanel 
                  task={selectedTask} 
                  onMarkComplete={handleMarkComplete}
                  onNavigate={handleNavigateDay}
                  totalDays={skillProgram.dailyTasks.length}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Draggable instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm border border-purple-700/50 z-10 pointer-events-none opacity-70">
        <span>Drag to explore • Scroll to zoom • Click on a task</span>
      </div>
      
      {/* Program progress statistics */}
      <div className="absolute top-4 left-4 bg-black/60 p-3 rounded-lg border border-purple-700/30 text-white text-sm z-10">
        <div className="font-medium mb-1">Program Progress</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-700"></div>
          <span>{skillProgram.dailyTasks.filter(t => t.status === 'completed').length}/30 Completed</span>
        </div>
      </div>
    </div>
  );
};

export default SkillProgramTree;