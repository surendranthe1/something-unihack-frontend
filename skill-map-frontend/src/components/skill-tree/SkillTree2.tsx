// src/components/skill-tree/SkillTree.tsx
import React, { useState, useEffect, useRef } from 'react';
import LinearSkillPath from './LinearSkillPath';
import NodeDetailPanel from './NodeDetailPanel';
import { SkillMap, SkillNode } from '../../types';
import { X, Minimize2, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { AnimatePresence, motion } from 'framer-motion';

interface SkillTreeProps {
  skillMap: SkillMap;
}

const SkillTree: React.FC<SkillTreeProps> = ({ skillMap }) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [nodeIndex, setNodeIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // When a node is clicked, open the panel
  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
    
    // Find the node's position in the tree
    const nodeKeys = Object.keys(skillMap.nodes);
    const index = nodeKeys.findIndex(key => key === node.id);
    setNodeIndex(index >= 0 ? index + 1 : 0);
    
    setIsPanelOpen(true);
  };
  
  // Close the panel
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };
  
  return (
    <div ref={containerRef} className="bg-black/30 border border-purple-700/30 rounded-lg p-4 relative overflow-hidden">
      <div className="flex h-full">
        {/* Main container for both tree and panel */}
        <div className="w-full flex flex-col md:flex-row relative">
          {/* Skill Tree with hidden scrollbars */}
          <div 
            className={`${isPanelOpen ? 'md:w-2/3 lg:w-3/4' : 'w-full'} transition-all duration-300 ease-in-out`} 
            style={{ 
              maxHeight: '80vh',
              // CSS to hide scrollbars but maintain functionality
              overflow: 'hidden'
            }}
          >
            <div className={`${isPanelOpen ? 'pr-4' : ''} h-full`} style={{ height: '80vh' }}>
              <LinearSkillPath skillMap={skillMap} onNodeClick={handleNodeClick} />
            </div>
          </div>
          
          {/* Detail Panel for desktop */}
          <AnimatePresence>
            {isPanelOpen && selectedNode && !isMobile && (
              <motion.div 
                className="hidden md:block md:w-1/3 lg:w-1/4 overflow-y-auto hide-scrollbar"
                style={{ maxHeight: '80vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Styles for hiding scrollbars are now in the global CSS */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-900/90 to-black/90 backdrop-blur-sm border-b border-purple-700/30 p-3 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="bg-purple-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      {nodeIndex}
                    </span>
                    Skill Details
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleClosePanel}
                    className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                  >
                    <Minimize2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="p-4">
                  <NodeDetailPanel node={selectedNode} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile Layout */}
      {isMobile && (
        <Sheet open={isPanelOpen && isMobile} onOpenChange={setIsPanelOpen}>
          <SheetContent side="bottom" className="h-[90vh] p-0 border-t border-purple-700/50 bg-black/95">
            <SheetHeader className="bg-gradient-to-r from-purple-900/90 to-black/90 p-3 border-b border-purple-700/30">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClosePanel}
                  className="rounded-full h-8 w-8 hover:bg-purple-900/50"
                >
                  <ArrowLeft className="h-4 w-4 text-white" />
                </Button>
                <SheetTitle className="text-white">Skill Details</SheetTitle>
                <div className="w-8"></div> {/* Empty div for centering */}
              </div>
            </SheetHeader>
            <div className="p-4 pb-24 hide-scrollbar" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', height: 'calc(90vh - 60px)' }}>
              {/* Styles for hiding scrollbars are now in the global CSS */}
              {selectedNode && <NodeDetailPanel node={selectedNode} />}
            </div>
          </SheetContent>
        </Sheet>
      )}
      
      {/* Draggable instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm border border-purple-700/50 z-10 pointer-events-none opacity-70">
        <span>Drag to explore • Scroll to zoom</span>
      </div>
    </div>
  );
};

export default SkillTree;