import React from 'react';
import { SkillNodeType } from '../../types';

interface SkillNodeProps {
  node: SkillNodeType;
  isRoot?: boolean;
  isSelected?: boolean;
  onClick: (node: SkillNodeType) => void;
}

const SkillNode: React.FC<SkillNodeProps> = ({ 
  node, 
  isRoot = false, 
  isSelected = false,
  onClick 
}) => {
  const handleClick = () => onClick(node);
  
  // Determine styles based on node type and status
  const gradientClass = isRoot 
    ? "from-purple-600 to-blue-600" 
    : node.status === 'completed'
      ? "from-green-500 to-green-700"
      : node.status === 'in_progress'
        ? "from-blue-500 to-blue-700"
        : "from-purple-500 to-purple-700";
  
  const sizeClass = isRoot 
    ? "w-24 h-24 md:w-32 md:h-32" 
    : "w-20 h-20 md:w-24 md:h-24";
  
  const animationClass = isSelected 
    ? "animate-pulse" 
    : isRoot 
      ? "animate-pulse" 
      : "";
  
  return (
    <div 
      className={`${sizeClass} rounded-full bg-gradient-to-r ${gradientClass} flex items-center justify-center p-1 cursor-pointer ${animationClass}`}
      onClick={handleClick}
    >
      <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
        <span className="text-white text-xs md:text-sm font-medium text-center px-2">
          {node.name}
        </span>
      </div>
    </div>
  );
};

export default SkillNode;