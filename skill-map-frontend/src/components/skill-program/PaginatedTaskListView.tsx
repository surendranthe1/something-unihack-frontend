// src/components/skill-program/PaginatedTaskListView.tsx
import React, { useState } from 'react';
import { SkillProgram, DailyTask } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle, Circle, Clock, BookOpen, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Progress } from '../ui/progress';
import { useSkillContext } from '../../context/SkillContext';
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import skillProgramService from '../../services/skillProgramService';

interface PaginatedTaskListViewProps {
  skillProgram: SkillProgram;
  onTaskClick?: (task: DailyTask) => void;
}

const PaginatedTaskListView: React.FC<PaginatedTaskListViewProps> = ({ skillProgram, onTaskClick }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);
  const [updating, setUpdating] = useState(false);
  
  const { setSkillProgram } = useSkillContext();
  const { userProfile } = useContext(UserContext);
  
  // Get current tasks based on pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = skillProgram.dailyTasks.slice(indexOfFirstTask, indexOfLastTask);
  
  // Calculate total pages
  const totalPages = Math.ceil(skillProgram.dailyTasks.length / tasksPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Mark task as complete or in progress
  const handleMarkComplete = async (task: DailyTask) => {
    if (!userProfile?.userId) return;
    
    setUpdating(true);
    
    try {
      // Toggle status
      const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
      const completionPercentage = newStatus === 'completed' ? 100 : 50;
      
      // Update locally first for immediate feedback
      const updatedTasks = [...skillProgram.dailyTasks];
      const taskIndex = updatedTasks.findIndex(t => t.day === task.day);
      
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
          [{
            day: task.day,
            completionPercentage,
            timeSpent: task.estimatedHours, // Assuming they spent the estimated time
            notes: `Marked as ${newStatus}`
          }]
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert to original status on error
      const originalStatus = task.status;
      
      const updatedTasks = [...skillProgram.dailyTasks];
      const taskIndex = updatedTasks.findIndex(t => t.day === task.day);
      
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
  
  // Calculate overall progress
  const completedTasks = skillProgram.dailyTasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = skillProgram.dailyTasks.filter(task => task.status === 'in_progress').length;
  const overallProgress = Math.round((completedTasks / skillProgram.dailyTasks.length) * 100);
  
  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-600';
      case 'intermediate':
        return 'bg-blue-600';
      case 'advanced':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Get status badge color and icon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-pink-500', icon: <CheckCircle className="h-4 w-4 mr-1" /> };
      case 'in_progress':
        return { color: 'bg-yellow-500', icon: <Activity className="h-4 w-4 mr-1" /> };
      default:
        return { color: 'bg-gray-500', icon: <Circle className="h-4 w-4 mr-1" /> };
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress overview card */}
      <Card className="bg-black/30 border-purple-700/30">
        <CardHeader>
          <CardTitle>30-Day Program Progress</CardTitle>
          <CardDescription>
            Track your progress through all 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-purple-700/20">
                <div className="text-sm text-purple-300">Completed</div>
                <div className="text-pink-400 text-xl font-bold">{completedTasks}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-purple-700/20">
                <div className="text-sm text-purple-300">In Progress</div>
                <div className="text-yellow-400 text-xl font-bold">{inProgressTasks}</div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-purple-700/20">
                <div className="text-sm text-purple-300">Remaining</div>
                <div className="text-purple-400 text-xl font-bold">
                  {skillProgram.dailyTasks.length - completedTasks - inProgressTasks}
                </div>
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
        </CardContent>
      </Card>
      
      {/* Task list with cards */}
      <div className="space-y-4">
        {currentTasks.map((task) => {
          const statusBadge = getStatusBadge(task.status);
          
          return (
            <Card 
              key={task.day} 
              className="bg-black/30 border-purple-700/30 hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => onTaskClick && onTaskClick(task)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge className={statusBadge.color}>
                      <div className="flex items-center">
                        {statusBadge.icon}
                        <span>{task.status === 'not_started' ? 'Not Started' : 
                              task.status === 'in_progress' ? 'In Progress' : 'Completed'}</span>
                      </div>
                    </Badge>
                    <Badge className={getDifficultyColor(task.difficultyLevel)}>
                      {task.difficultyLevel}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="bg-black/30 text-white border-gray-700">
                    {task.day}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{task.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-gray-300 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center mt-3 text-sm text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{task.estimatedHours} hours</span>
                  
                  {task.resources && task.resources.length > 0 && (
                    <div className="flex items-center ml-4">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{task.resources.length} resource{task.resources.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`w-full ${
                    task.status !== 'completed' 
                      ? 'hover:bg-pink-900/30 hover:border-pink-500/50' 
                      : 'hover:bg-yellow-900/30 hover:border-yellow-500/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(task);
                  }}
                  disabled={updating}
                >
                  {task.status !== 'completed' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Mark In Progress
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Pagination controls using shadcn UI */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={goToPreviousPage} 
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {/* Generate pagination links */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => {
            // Show first page, current page, last page, and pages immediately around current page
            if (
              number === 1 || 
              number === totalPages || 
              (number >= currentPage - 1 && number <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={number}>
                  <PaginationLink 
                    onClick={() => paginate(number)}
                    isActive={currentPage === number}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            
            // Show ellipsis for breaks in sequence
            if (number === 2 && currentPage > 3) {
              return (
                <PaginationItem key="ellipsis-start">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            if (number === totalPages - 1 && currentPage < totalPages - 2) {
              return (
                <PaginationItem key="ellipsis-end">
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={goToNextPage}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginatedTaskListView;