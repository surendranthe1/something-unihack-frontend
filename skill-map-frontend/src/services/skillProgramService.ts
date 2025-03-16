// src/services/skillProgramService.ts
import apiClient from './api';
import { 
  SkillProgram, 
  DailyTask,
  UserProfile, 
  LearningPreferences,
  TaskProgressData,
  ContextChange,
  SkillProgramRequest,
  SkillProgramResponse
} from '../types';

// Set to false to use the real backend
import env from '../config/env';
const USE_MOCK_DATA = env.ENABLE_MOCKS;

/**
 * Generate a 30-day skill program using the backend API
 */
const generateSkillProgram = async (
  skillName: string,
  userProfile?: UserProfile,
): Promise<SkillProgram> => {
  if (USE_MOCK_DATA) {
    console.log('Using mock data for testing');
    return generateMockSkillProgram(skillName);
  }
  
  try {
    const request: SkillProgramRequest = {
      skill_name: skillName,
      user_profile: userProfile ? mapUserProfileToBackend(userProfile) : undefined,
      learning_preferences: userProfile?.goals ? {
        resource_types: ["courses", "articles", "videos"],
        difficulty_progression: "gradual",
        focus_areas: userProfile.goals
      } : undefined
    };

    console.log('Sending request to backend:', request);
    
    const response = await apiClient.post<any>('/skill-programs', request);
    
    console.log('Response received:', response);
    console.log('Response data:', response.data);
    
    // Extract the skill program based on the response structure
    let skillProgramData;
    
    if (response.data?.data?.skill_program) {
      // If nested inside response.data.data.skill_program
      skillProgramData = response.data.data.skill_program;
    } else if (response.data?.skill_program) {
      // If nested inside response.data.skill_program
      skillProgramData = response.data.skill_program;
    } else if (response.data?.data) {
      // If nested inside response.data.data
      skillProgramData = response.data.data;
    } else {
      // If directly in response.data
      skillProgramData = response.data;
    }
    
    console.log('Extracted skill program data:', skillProgramData);
    
    // Transform the response to match our frontend model
    return mapSkillProgramFromResponse(skillProgramData);
  } catch (error) {
    console.error('Error generating skill program:', error);
    
    // Fallback to mock data if there's an error connecting to the backend
    console.log('Falling back to mock data due to API error');
    return generateMockSkillProgram(skillName);
  }
};

/**
 * Get all skill programs for a user
 */
const getUserSkillPrograms = async (userId: string): Promise<SkillProgram[]> => {
  try {
    const response = await apiClient.get(`/skill-programs/user/${userId}`);
    return response.data.data.map((program: any) => mapSkillProgramFromResponse(program));
  } catch (error) {
    console.error('Error fetching skill programs:', error);
    throw error;
  }
};

/**
 * Get a specific skill program by ID
 */
const getSkillProgram = async (skillProgramId: string): Promise<SkillProgram> => {
  try {
    const response = await apiClient.get(`/skill-programs/${skillProgramId}`);
    return mapSkillProgramFromResponse(response.data.data);
  } catch (error) {
    console.error('Error fetching skill program:', error);
    throw error;
  }
};

/**
 * Search for skill programs by name
 */
const searchSkillPrograms = async (query: string, limit: number = 10): Promise<SkillProgram[]> => {
  try {
    const response = await apiClient.get(`/skill-programs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.data.map((program: any) => mapSkillProgramFromResponse(program));
  } catch (error) {
    console.error('Error searching skill programs:', error);
    throw error;
  }
};

/**
 * Update progress on a skill program task
 */
const updateTaskProgress = async (
  skillProgramId: string,
  userId: string,
  progressData: TaskProgressData[],
  contextChanges?: ContextChange[]
): Promise<SkillProgram> => {
  try {
    const response = await apiClient.post('/skill-programs/progress', {
      user_id: userId,
      skill_program_id: skillProgramId,
      progress_data: progressData.map(item => ({
        node_id: item.day.toString(), // Convert day number to string for the API
        completion_percentage: item.completionPercentage,
        time_spent: item.timeSpent,
        notes: item.notes
      })),
      context_changes: contextChanges?.map(item => ({
        change_type: item.changeType,
        description: item.description,
        impact_factor: item.impactFactor,
        affected_period: {
          start: item.affectedPeriod.start,
          end: item.affectedPeriod.end
        }
      }))
    });
    
    return mapSkillProgramFromResponse(response.data.data);
  } catch (error) {
    console.error('Error updating task progress:', error);
    throw error;
  }
};

/**
 * Helper function to map user profile to backend format
 */
const mapUserProfileToBackend = (profile: UserProfile): any => {
  return {
    user_id: profile.userId,
    current_skill_level: profile.currentSkillLevel,
    learning_style_preferences: profile.learningStylePreferences,
    time_availability: {
      hours_per_week: profile.timeAvailability.hoursPerWeek,
      preferred_session_length: profile.timeAvailability.preferredSessionLength,
      preferred_days: profile.timeAvailability.preferredDays
    },
    background_knowledge: profile.backgroundKnowledge || [],
    goals: profile.goals || []
  };
};

/**
 * Helper function to map skill program from backend response to frontend model
 */
const mapSkillProgramFromResponse = (data: any): SkillProgram => {
  console.log('Mapping skill program data to frontend model:', data);

  // Check if we have a valid data object
  if (!data) {
    console.error('Invalid skill program data received:', data);
    return generateMockSkillProgram('Default Skill');
  }
  
  // Check if daily_tasks property exists
  if (!data.daily_tasks) {
    console.error('No daily tasks found in skill program data:', data);
    return generateMockSkillProgram(data.skill_name || 'Default Skill');
  }
  
  // Transform the daily tasks to match our frontend model
  const dailyTasks: DailyTask[] = data.daily_tasks.map((taskData: any) => ({
    day: taskData.day,
    name: taskData.name,
    description: taskData.description,
    difficultyLevel: taskData.difficulty_level || taskData.difficultyLevel || 'Beginner',
    estimatedHours: taskData.estimated_hours || taskData.estimatedHours || 1,
    resources: (taskData.resources || []).map((resource: any) => ({
      type: resource.type,
      name: resource.name,
      url: resource.url,
      description: resource.description
    })),
    progress: taskData.progress || 0,
    status: taskData.status || 'not_started'
  }));
  
  return {
    id: data.id || `skill-program-${Date.now()}`,
    skillName: data.skill_name || data.skillName || 'Skill Program',
    description: data.description || `30-day program for ${data.skill_name || data.skillName || 'skill development'}`,
    dailyTasks: dailyTasks,
    totalHours: data.total_hours || data.totalHours || dailyTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
    expectedCompletionDate: new Date(data.expected_completion_date || data.expectedCompletionDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: data.user_id || data.userId
  };
};

/**
 * Mock implementation for testing without backend
 */
const generateMockSkillProgram = (skillName: string): SkillProgram => {
  // Generate 30 daily tasks with increasing difficulty
  const dailyTasks: DailyTask[] = [];
  
  for (let day = 1; day <= 30; day++) {
    // Determine difficulty level based on day
    let difficultyLevel = 'Beginner';
    if (day > 20) {
      difficultyLevel = 'Advanced';
    } else if (day > 10) {
      difficultyLevel = 'Intermediate';
    }
    
    // Vary estimated hours slightly
    const estimatedHours = Math.max(0.5, Math.min(3, 1 + (day % 5) * 0.5));
    
    dailyTasks.push({
      day,
      name: `Day ${day}: ${getTaskName(skillName, day)}`,
      description: `${getTaskDescription(skillName, day, difficultyLevel)}`,
      difficultyLevel,
      estimatedHours,
      resources: [
        { 
          type: day % 3 === 0 ? 'video' : day % 3 === 1 ? 'article' : 'exercise',
          name: `${skillName} - ${difficultyLevel} Tutorial ${day}`,
          url: day % 2 === 0 ? `https://example.com/${skillName.toLowerCase()}/day${day}` : undefined,
          description: `Resource for day ${day} of your ${skillName} learning journey`
        }
      ],
      progress: 0,
      status: 'not_started'
    });
  }
  
  // Calculate total hours
  const totalHours = dailyTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  
  // Calculate expected completion date (30 days from now)
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + 30);
  
  return {
    id: `skill-program-${Date.now()}`,
    skillName: skillName,
    description: `30-day skill program for learning ${skillName}. This program is designed to take you from beginner to advanced through daily structured tasks.`,
    dailyTasks,
    totalHours,
    expectedCompletionDate: completionDate,
    userId: 'temp-user-id'
  };
};

// Helper function to generate task names based on the day
function getTaskName(skillName: string, day: number): string {
  if (day <= 10) {
    return [
      `Introduction to ${skillName}`,
      `Basic ${skillName} Concepts`,
      `${skillName} Fundamentals`,
      `Core ${skillName} Techniques`,
      `Getting Started with ${skillName}`,
      `${skillName} Basics Practice`,
      `Understanding ${skillName} Principles`,
      `Building Your First ${skillName} Project`,
      `${skillName} Core Skills`,
      `${skillName} Foundations Review`
    ][day - 1];
  } else if (day <= 20) {
    return [
      `Intermediate ${skillName} Concepts`,
      `Advanced ${skillName} Techniques`,
      `Building with ${skillName}`,
      `${skillName} Problem Solving`,
      `${skillName} Integration`,
      `Real-world ${skillName} Application`,
      `${skillName} Best Practices`,
      `Optimizing Your ${skillName} Skills`,
      `${skillName} Challenge Project`,
      `Intermediate ${skillName} Review`
    ][day - 11];
  } else {
    return [
      `Advanced ${skillName} Concepts`,
      `${skillName} Mastery Techniques`,
      `Complex ${skillName} Problem Solving`,
      `${skillName} Integration and Scaling`,
      `${skillName} in Production Environments`,
      `${skillName} Best Practices`,
      `${skillName} Performance Optimization`,
      `Advanced ${skillName} Project`,
      `Expert ${skillName} Challenge`,
      `Final ${skillName} Mastery Project`
    ][day - 21];
  }
}

// Helper function to generate task descriptions based on the day and difficulty
function getTaskDescription(skillName: string, day: number, difficulty: string): string {
  const phaseDesc = day <= 10 
    ? `In this early stage, you'll learn the fundamental concepts of ${skillName}.` 
    : day <= 20 
      ? `Building on your foundational knowledge, you'll explore more complex aspects of ${skillName}.`
      : `In this advanced stage, you'll tackle challenging concepts and build expertise in ${skillName}.`;
      
  const taskDesc = day % 3 === 0 
    ? `Today you'll complete a hands-on project to apply your knowledge.`
    : day % 3 === 1 
      ? `Today focuses on learning key theoretical concepts through study and examples.`
      : `Today you'll practice through exercises and guided problem-solving.`;
      
  return `Day ${day} of your ${skillName} learning journey. ${phaseDesc} ${taskDesc} ${difficulty} level activities will help build your competence and confidence.`;
}

export default {
  generateSkillProgram,
  getUserSkillPrograms,
  getSkillProgram,
  searchSkillPrograms,
  updateTaskProgress,
  generateMockSkillProgram // Keep for testing
};