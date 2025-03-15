// src/components/skill-tree/ResponsiveSkillPathWrapper.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LinearSkillPath from './LinearSkillPath';
import { SkillMap, SkillNode } from '../../types';

interface ResponsiveSkillPathWrapperProps {
  skillMap: SkillMap;
  onNodeClick: (node: SkillNode) => void;
  isPanelOpen: boolean;
}

const ResponsiveSkillPathWrapper: React.FC<ResponsiveSkillPathWrapperProps> = ({ 
  skillMap, 
  onNodeClick,
  isPanelOpen
}) => {
  const [containerWidth, setContainerWidth] = useState('100%');
  
  // Update container width based on screen size and panel state
  useEffect(() => {
    const updateWidth = () => {
      const windowWidth = window.innerWidth;
      
      if (isPanelOpen) {
        if (windowWidth >= 1280) { // xl breakpoint
          setContainerWidth('calc(100% - 480px)'); // 480px panel width on xl screens
        } else if (windowWidth >= 1024) { // lg breakpoint
          setContainerWidth('calc(100% - 400px)'); // 400px panel width on lg screens
        } else if (windowWidth >= 768) { // md breakpoint
          setContainerWidth('calc(100% - 320px)'); // 320px panel width on md screens
        } else {
          setContainerWidth('100%'); // On mobile, skill tree is hidden when panel is open
        }
      } else {
        setContainerWidth('100%');
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isPanelOpen]);
  
  return (
    <motion.div
      className="bg-black/30 border border-purple-700/30 rounded-lg p-4 h-full"
      initial={{ width: '100%' }}
      animate={{ 
        width: containerWidth,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      <LinearSkillPath 
        skillMap={skillMap} 
        onNodeClick={onNodeClick} 
      />
    </motion.div>
  );
};

export default ResponsiveSkillPathWrapper;