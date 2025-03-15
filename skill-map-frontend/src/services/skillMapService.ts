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
import env from '../config/env';
const USE_MOCK_DATA = env.ENABLE_MOCKS;

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
  
  try {
    const request: SkillMapRequest = {
      skill_name: skillName,
      user_profile: userProfile ? mapUserProfileToBackend(userProfile) : undefined,
      learning_preferences: userProfile?.goals ? {
        resource_types: ["courses", "articles", "videos"],
        difficulty_progression: "gradual",
        focus_areas: userProfile.goals
      } : undefined,
      time_frame: timeFrame
    };

    console.log('Sending request to backend:', request);
    
    const response = await apiClient.post<any>('/skill-maps', request);
    
    console.log('Response received:', response);
    console.log('Response data:', response.data);
    
    // Extract the skill map based on the response structure
    let skillMapData;
    
    if (response.data?.data?.skill_map) {
      // If nested inside response.data.data.skill_map
      skillMapData = response.data.data.skill_map;
    } else if (response.data?.skill_map) {
      // If nested inside response.data.skill_map
      skillMapData = response.data.skill_map;
    } else if (response.data?.data) {
      // If nested inside response.data.data
      skillMapData = response.data.data;
    } else {
      // If directly in response.data
      skillMapData = response.data;
    }
    
    console.log('Extracted skill map data:', skillMapData);
    
    // Transform the response to match our frontend model
    return mapSkillMapFromResponse(skillMapData);
  } catch (error) {
    console.error('Error generating skill map:', error);
    
    // Fallback to mock data if there's an error connecting to the backend
    console.log('Falling back to mock data due to API error');
    return generateMockSkillMap(skillName);
  }
};

/**
 * Get all skill maps for a user
 */
const getUserSkillMaps = async (userId: string): Promise<SkillMap[]> => {
  try {
    const response = await apiClient.get(`/skill-maps/user/${userId}`);
    return response.data.data.map((map: any) => mapSkillMapFromResponse(map));
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
    const response = await apiClient.get(`/skill-maps/${skillMapId}`);
    return mapSkillMapFromResponse(response.data.data);
  } catch (error) {
    console.error('Error fetching skill map:', error);
    throw error;
  }
};

/**
 * Search for skill maps by name
 */
const searchSkillMaps = async (query: string, limit: number = 10): Promise<SkillMap[]> => {
  try {
    const response = await apiClient.get(`/skill-maps/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data.data.map((map: any) => mapSkillMapFromResponse(map));
  } catch (error) {
    console.error('Error searching skill maps:', error);
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
      user_id: userId,
      skill_map_id: skillMapId,
      progress_data: progressData.map(item => ({
        node_id: item.nodeId,
        completion_percentage: item.completionPercentage,
        time_spent: item.timeSpent,
        notes: item.notes,
        assessment_results: item.assessmentResults
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
    
    return mapSkillMapFromResponse(response.data.updated_skill_map);
  } catch (error) {
    console.error('Error updating progress:', error);
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
 * Helper function to map skill map from backend response to frontend model
 */
const mapSkillMapFromResponse = (data: any): SkillMap => {
  console.log('Mapping skill map data to frontend model:', data);

  // Check if we have a valid data object
  if (!data) {
    console.error('Invalid skill map data received:', data);
  }
  
  // Check if nodes property exists
  if (!data.nodes) {
    console.error('No nodes found in skill map data:', data);
  }
  // Transform the nodes to match our frontend model
  const nodes: Record<string, SkillNode> = {};
    
  Object.entries(data.nodes).forEach(([nodeId, nodeData]: [string, any]) => {
    nodes[nodeId] = {
      id: nodeId,
      name: nodeData.name,
      description: nodeData.description,
      estimatedHours: nodeData.estimated_hours || nodeData.estimatedHours || 0,
      parentId: nodeData.parent_id || nodeData.parentId,
      children: nodeData.children || [],
      resources: (nodeData.resources || []).map((resource: any) => ({
        type: resource.type,
        name: resource.name,
        url: resource.url,
        description: resource.description
      })),
      depth: nodeData.depth || 0,
      progress: nodeData.progress || 0,
      status: nodeData.status || 'not_started'
    };
  });
  
  return {
    id: data.id || `skill-map-${Date.now()}`,
    rootSkill: data.root_skill || data.rootSkill || 'Skill',
    nodes: nodes,
    totalEstimatedHours: data.total_estimated_hours || data.totalEstimatedHours || 0,
    expectedCompletionDate: new Date(data.expected_completion_date || data.expectedCompletionDate || Date.now()),
    userId: data.user_id || data.userId
  };
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
  searchSkillMaps,
  updateProgress,
  generateMockSkillMap // Keep for testing
};