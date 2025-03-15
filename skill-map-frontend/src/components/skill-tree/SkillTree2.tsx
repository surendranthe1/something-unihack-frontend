// src/components/skill-tree/SkillTree.tsx
import React, { useState } from 'react';
import LinearSkillPath from './LinearSkillPath';
import NodeDetailPanel from './NodeDetailPanel';
import { SkillMap, SkillNode } from '../../types';

interface SkillTreeProps {
  skillMap: SkillMap;
}

const SkillTree: React.FC<SkillTreeProps> = ({ skillMap }) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  
  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
  };
  
  return (
    <div className="space-y-12">
      <div className="bg-black/30 border border-purple-700/30 rounded-lg p-4">
        <LinearSkillPath skillMap={skillMap} onNodeClick={handleNodeClick} />
      </div>
      
      {/* Node Detail Panel */}
      {selectedNode && (
        <NodeDetailPanel node={selectedNode} />
      )}
    </div>
  );
};

export default SkillTree;