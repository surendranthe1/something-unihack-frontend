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

// Request interfaces
export interface SkillMapRequest {
  skillName: string;
  userProfile?: UserProfile;
  learningPreferences?: LearningPreferences;
  timeFrame?: number;
}

export interface SkillMapResponse {
  skillMap: SkillMap;
  userId?: string;
}

// Added for frontend visualization purposes
export interface SkillMapEdge {
  source: string;
  target: string;
}

// Helper function to convert backend SkillMap to a format suitable for D3 visualization
export function prepareSkillMapForVisualization(skillMap: SkillMap): {
  nodes: Array<SkillNode & { prerequisites: string[] }>;
  edges: SkillMapEdge[];
} {
  const nodeList: Array<SkillNode & { prerequisites: string[] }> = [];
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