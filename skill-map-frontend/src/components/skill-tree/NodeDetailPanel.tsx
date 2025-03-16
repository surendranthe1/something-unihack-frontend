import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Activity, BookOpen, Video, Clock, CheckCircle, Circle, Info } from 'lucide-react';
import { SkillNode } from '../../types';
import { ReviewPopup } from "@/components/review-popup"

interface NodeDetailPanelProps {
  node: SkillNode;
  onStatusChange: (nodeId: string, newStatus: 'completed' | 'in_progress' | 'not_started') => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onStatusChange }) => {
  const [showReview, setShowReview] = useState(false);

  // Determine status icon and color
  const getStatusInfo = () => {
    switch (node.status) {
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500 text-white' };
      case 'in_progress':
        return { icon: <Activity className="h-4 w-4" />, color: 'bg-blue-500 text-white' };
      default:
        return { icon: <Circle className="h-4 w-4" />, color: 'bg-purple-500 text-white' };
    }
  };

  const statusInfo = getStatusInfo();

  // Handler to update status after review
  const markAsCompleted = () => {
    setShowReview(true); // Show review popup instead of confirmation
  };

  const handleReviewSubmit = (ratings: { overall: number; resources: number; project: number }) => {
    console.log("Review submitted for node", node.id, ":", ratings);
    onStatusChange(node.id, 'completed');
    setShowReview(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with gradient background */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Badge className={statusInfo.color}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {node.status === 'not_started' && 'Not Started'}
              {node.status === 'in_progress' && 'In Progress'}
              {node.status === 'completed' && 'Completed'}
            </div>
          </Badge>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{node.name}</h2>
        <p className="text-purple-200 text-sm">{node.description}</p>
      </div>

      {/* Mark as Completed Button */}
      {node.status !== 'completed' && (
        <Button
          className="bg-green-600 text-white hover:bg-green-700 transition-all w-full"
          onClick={markAsCompleted}
        >
          Review
        </Button>
      )}

      {/* Review Popup replacing the confirmation Dialog */}
      <ReviewPopup 
        open={showReview} 
        onOpenChange={setShowReview} 
        onSubmit={handleReviewSubmit}
      />

      {/* Time estimate */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-purple-700/20">
        <Clock className="h-5 w-5 text-purple-400" />
        <div>
          <div className="text-sm text-purple-300">Estimated Time</div>
          <div className="text-white font-bold">{node.estimatedHours} hours</div>
        </div>
      </div>

      {/* Recommended Resources */}
      {node.resources && node.resources.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-purple-200 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span>Learning Resources</span>
          </h3>
          <Separator className="my-2 bg-purple-700/30" />
          <ul className="space-y-3 mt-3">
            {node.resources.map((resource, index) => (
              <li key={index} className="bg-black/40 p-3 rounded-lg border border-purple-700/30 hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
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
                        className="text-blue-400 text-xs hover:text-blue-300 mt-1 inline-block"
                      >
                        Open resource →
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Skills */}
      {node.children && node.children.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-purple-200 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>Related Skills</span>
          </h3>
          <Separator className="my-2 bg-purple-700/30" />
          <div className="bg-black/40 p-4 rounded-lg border border-purple-700/30 mt-3">
            <p className="text-white text-sm mb-2">
              After mastering this skill, you'll be ready to learn:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {node.children.map((child, index) => (
                <Badge key={index} variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-700/50">
                  {child}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetailPanel;