// src/types/index.ts 

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  READING = 'reading',
  KINESTHETIC = 'kinesthetic'
}

export interface LearningPreferences {
  resourceTypes?: string[];
  difficultyProgression?: string;
  focusAreas?: string[];
}

export interface TimeAvailability {
  hoursPerWeek: number;
  preferredSessionLength?: number;
  preferredDays?: string[];
}

export interface UserProfile {
  userId: string;
  currentSkillLevel: SkillLevel;
  learningStylePreferences: LearningStyle[];
  timeAvailability: TimeAvailability;
  backgroundKnowledge?: string[];
  goals?: string[];
}

export interface SkillResource {
  type: string;
  name: string;
  url?: string;
  description?: string;
}

// Updated to match backend structure
export interface SkillNode {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  parentId?: string;
  children: string[];
  resources: SkillResource[];
  depth: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

// Interface for progress updates
export interface ProgressData {
  nodeId: string;
  completionPercentage: number;
  timeSpent: number;
  notes?: string;
  assessmentResults?: Record<string, any>;
}

// Interface for context changes
export interface ContextChange {
  changeType: string;
  description: string;
  impactFactor: number;
  affectedPeriod: {
    start: Date;
    end: Date;
  };
}

// Updated to match backend structure
export interface SkillMap {
  id: string;
  rootSkill: string;
  nodes: Record<string, SkillNode>;
  totalEstimatedHours: number;
  expectedCompletionDate: Date;
  userId?: string;
}

// Request interfaces - Updated to match backend API formats
export interface SkillMapRequest {
  skill_name: string;
  user_profile?: {
    user_id: string;
    current_skill_level: SkillLevel;
    learning_style_preferences: LearningStyle[];
    time_availability: {
      hours_per_week: number;
      preferred_session_length?: number;
      preferred_days?: string[];
    };
    background_knowledge?: string[];
    goals?: string[];
  };
  learning_preferences?: {
    resource_types?: string[];
    difficulty_progression?: string;
    focus_areas?: string[];
  };
  time_frame?: number;
}

export interface SkillMapResponse {
  success: boolean;
  data: any;
  message?: string;
  skill_map: {
    id: string;
    root_skill: string;
    nodes: Record<string, {
      id: string;
      name: string;
      description: string;
      estimated_hours: number;
      parent_id?: string;
      children: string[];
      resources: {
        type: string;
        name: string;
        url?: string;
        description?: string;
      }[];
      depth: number;
      progress: number;
      status: string;
    }>;
    total_estimated_hours: number;
    expected_completion_date: string;
    user_id?: string;
  };
  user_id?: string;
}

// Added for frontend visualization purposes
export interface SkillMapEdge {
  source: string;
  target: string;
}

// For D3 visualization
export interface SkillNodeType extends SkillNode {
  prerequisites: string[];
}

// Helper function to convert backend SkillMap to a format suitable for D3 visualization
export function prepareSkillMapForVisualization(skillMap: SkillMap): {
  nodes: Array<SkillNodeType>;
  edges: SkillMapEdge[];
} {
  const nodeList: Array<SkillNodeType> = [];
  const edgeList: SkillMapEdge[] = [];
  
  // Convert nodes object to array and add prerequisites field
  Object.values(skillMap.nodes).forEach(node => {
    nodeList.push({
      ...node,
      prerequisites: node.parentId ? [node.parentId] : []
    });
    
    // Create edges from parent to children
    if (node.children && node.children.length > 0) {
      node.children.forEach(childId => {
        edgeList.push({
          source: node.id,
          target: childId
        });
      });
    }
  });
  
  return { nodes: nodeList, edges: edgeList };
}