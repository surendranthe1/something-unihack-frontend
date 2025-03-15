// src/services/skillMapService.ts
import apiClient from './api';
import { 
  SkillMap, 
  SkillNode,
  UserProfile, 
  LearningPreferences,
  ProgressData,
  ContextChange,
  SkillMapRequest,
  SkillMapResponse
} from '../types';

// Set to false to use the real backend
const USE_MOCK_DATA = false;

/**
 * Generate a skill map using the backend API
 */
const generateSkillMap = async (
  skillName: string,
  userProfile?: UserProfile,
  timeFrame?: number,
): Promise<SkillMap> => {
  if (USE_MOCK_DATA) {
    console.log('Using mock data for testing');
    return generateMockSkillMap(skillName);
  }
  if (!userProfile) {
    throw new Error('User profile is required');
  }
  
  try {
    
    const transformedRequest = {
      skillName, // Note: Use 'skillName' exactly as in the Zod schema
      userProfile: {
        userId: userProfile.userId || crypto.randomUUID(),
        currentSkillLevel: userProfile.currentSkillLevel,
        learningStylePreferences: userProfile.learningStylePreferences || [],
        timeAvailability: {
          hoursPerWeek: userProfile.timeAvailability.hoursPerWeek || 0,
          preferredSessionLength: userProfile.timeAvailability.preferredSessionLength || 0,
          preferredDays: userProfile.timeAvailability.preferredDays || []
        },
        backgroundKnowledge: userProfile.backgroundKnowledge || [],
        goals: userProfile.goals || []
      },
      learningPreferences: {
        resourceTypes: ["courses", "articles", "videos"],
        difficultyProgression: "gradual",
        focusAreas: userProfile.goals || []
      },
      timeFrame
    };

    console.log(transformedRequest)
    const response = await apiClient.post('/skills/generate', transformedRequest);
    return response.data;
  } catch (error) {
    console.error('Error generating skill map:', error);
    throw error;
  }
};

/**
 * Get all skill maps for a user
 */
const getUserSkillMaps = async (userId: string): Promise<SkillMap[]> => {
  try {
    const response = await apiClient.get(`/skills/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching skill maps:', error);
    throw error;
  }
};

/**
 * Get a specific skill map by ID
 */
const getSkillMap = async (skillMapId: string): Promise<SkillMap> => {
  try {
    const response = await apiClient.get(`/skills/${skillMapId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching skill map:', error);
    throw error;
  }
};

/**
 * Update progress on a skill map
 */
const updateProgress = async (
  skillMapId: string,
  userId: string,
  progressData: ProgressData[],
  contextChanges?: ContextChange[]
): Promise<SkillMap> => {
  try {
    const response = await apiClient.post('/progress/record', {
      userId,
      skillMapId,
      progressData,
      contextChanges
    });
    
    return response.data.updatedSkillMap;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

/**
 * Mock implementation for testing without backend
 */
const generateMockSkillMap = async (skillName: string): Promise<SkillMap> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const rootId = 'root';
  const fundamentalsId = 'fundamentals';
  const intermediateId = 'intermediate';
  const advancedId = 'advanced';
  
  // Generate a simple hierarchical skill map
  const nodes: Record<string, SkillNode> = {
    [rootId]: {
      id: rootId,
      name: skillName,
      description: `Master the skill of ${skillName}`,
      estimatedHours: 0,
      parentId: undefined,
      children: [fundamentalsId, intermediateId, advancedId],
      depth: 0,
      resources: [
        { type: 'book', name: `Introduction to ${skillName}` }
      ],
      progress: 0,
      status: 'not_started'
    },
    [fundamentalsId]: {
      id: fundamentalsId,
      name: `${skillName} Fundamentals`,
      description: `Learn the basics of ${skillName}`,
      estimatedHours: 20,
      parentId: rootId,
      children: [],
      depth: 1,
      resources: [
        { type: 'course', name: `Fundamentals of ${skillName}` }
      ],
      progress: 0,
      status: 'not_started'
    },
    [intermediateId]: {
      id: intermediateId,
      name: `Intermediate ${skillName}`,
      description: `Build on your ${skillName} fundamentals`,
      estimatedHours: 30,
      parentId: rootId,
      children: [],
      depth: 1,
      resources: [
        { type: 'book', name: `${skillName} in Practice` }
      ],
      progress: 0,
      status: 'not_started'
    },
    [advancedId]: {
      id: advancedId,
      name: `Advanced ${skillName}`,
      description: `Master advanced concepts in ${skillName}`,
      estimatedHours: 40,
      parentId: rootId,
      children: [],
      depth: 1,
      resources: [
        { type: 'project', name: `Build a ${skillName} project` }
      ],
      progress: 0,
      status: 'not_started'
    }
  };
  
  // Calculate total hours
  const totalHours = Object.values(nodes).reduce((sum, node) => sum + node.estimatedHours, 0);
  
  // Calculate expected completion date (3 months from now)
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + 3);
  
  return {
    id: `skill-map-${Date.now()}`,
    rootSkill: skillName,
    nodes,
    totalEstimatedHours: totalHours,
    expectedCompletionDate: completionDate,
    userId: 'temp-user-id'
  };
};

export default {
  generateSkillMap,
  getUserSkillMaps,
  getSkillMap,
  updateProgress,
  generateMockSkillMap // Keep for testing
};