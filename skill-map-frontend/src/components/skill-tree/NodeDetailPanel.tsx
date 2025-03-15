// src/components/skill-tree/NodeDetailPanel.tsx
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Activity, BookOpen, Video } from 'lucide-react';
import { SkillNode } from '../../types';

interface NodeDetailPanelProps {
  node: SkillNode;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node }) => {
  return (
    <Card className="max-w-3xl mx-auto bg-black/50 border border-purple-700/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mr-4">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{node.name}</h3>
            <p className="text-purple-200 text-sm">{node.description}</p>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-purple-900/20 rounded p-3 border border-purple-700/30">
            <div className="text-sm text-purple-300 mb-1">Estimated Time</div>
            <div className="text-white font-bold">{node.estimatedHours} hours</div>
          </div>
          <div className="bg-purple-900/20 rounded p-3 border border-purple-700/30">
            <div className="text-sm text-purple-300 mb-1">Status</div>
            <div className="text-white font-bold">
              {node.status === 'not_started' && 'Not Started'}
              {node.status === 'in_progress' && 'In Progress'}
              {node.status === 'completed' && 'Completed'}
            </div>
          </div>
        </div>
        
        {node.resources && node.resources.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Recommended Resources</h4>
            <ul className="space-y-3">
              {node.resources.map((resource, index) => (
                <li key={index} className="bg-black/40 p-3 rounded border border-purple-700/20 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 mr-3">
                    {resource.type === 'video' || resource.type === 'course' ? (
                      <Video className="h-4 w-4 text-white" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{resource.name}</div>
                    <div className="text-purple-300 text-xs">{resource.description || resource.type}</div>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-xs hover:text-blue-300"
                      >
                        Open resource
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Show related skills */}
        {node.children && node.children.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Related Skills</h4>
            <div className="bg-black/40 p-3 rounded border border-purple-700/20">
              <p className="text-white text-sm">
                This skill will help you learn:
                <span className="block mt-2 text-purple-300">
                  {node.children.join(", ")}
                </span>
              </p>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium text-purple-300 mb-2">What to focus on</h4>
          <p className="text-white text-sm">
            {node.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NodeDetailPanel;