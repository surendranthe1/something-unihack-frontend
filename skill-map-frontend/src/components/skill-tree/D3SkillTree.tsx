// src/components/skill-tree/D3SkillTree.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SkillMap, SkillNode, prepareSkillMapForVisualization } from '../../types';

interface D3SkillTreeProps {
  skillMap: SkillMap;
  onNodeClick: (node: SkillNode) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  status: string;
  group: number; // Level in hierarchy (depth)
  estimatedHours: number;
  // D3 force simulation will add these:
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

const D3SkillTree: React.FC<D3SkillTreeProps> = ({ skillMap, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const containerWidth = svgRef.current.parentElement?.clientWidth || 800;
        const containerHeight = window.innerHeight * 0.6; // 60% of viewport height
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!skillMap || !svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Convert skill map to visualization format
    const { nodes: nodeData, edges } = prepareSkillMapForVisualization(skillMap);
    
    // Find the root node and first level nodes
    const rootNodeId = Object.values(skillMap.nodes).find(node => !node.parentId)?.id || 'root';
    const firstLevelNodes = nodeData.filter(node => node.parentId === rootNodeId);
    const secondLevelNodes = nodeData.filter(node => 
      node.parentId && 
      node.parentId !== rootNodeId && 
      firstLevelNodes.some(n => n.id === node.parentId)
    );
    
    // Create nodes with fixed positions
    const nodes: D3Node[] = [
      // Root node in center
      {
        id: rootNodeId,
        name: skillMap.rootSkill,
        status: 'root',
        group: 0,
        estimatedHours: skillMap.totalEstimatedHours,
        fx: dimensions.width / 2,
        fy: dimensions.height / 2,
      },
    ];
    
    // Arrange first level nodes in a circle around root
    const firstLevelRadius = 180; // Distance from root to first level
    firstLevelNodes.forEach((node, i) => {
      const angle = (i / firstLevelNodes.length) * 2 * Math.PI;
      nodes.push({
        id: node.id,
        name: node.name,
        status: node.status,
        group: 1,
        estimatedHours: node.estimatedHours,
        fx: dimensions.width / 2 + firstLevelRadius * Math.cos(angle),
        fy: dimensions.height / 2 + firstLevelRadius * Math.sin(angle),
      });
    });
    
    // Arrange second level nodes around their parents
    const secondLevelRadius = 100; // Additional distance from first level
    secondLevelNodes.forEach((node, i) => {
      // Find the parent node
      const parentId = node.parentId;
      
      if (parentId) {
        // Get position of parent node
        const parentNode = nodes.find(n => n.id === parentId);
        
        if (parentNode && parentNode.fx !== undefined && parentNode.fy !== undefined) {
          // Calculate angle based on index and total nodes with same parent
          const siblingNodes = secondLevelNodes.filter(n => n.parentId === parentId);
          const siblingIndex = siblingNodes.findIndex(n => n.id === node.id);
          const totalSiblings = siblingNodes.length;
          const spreadAngle = Math.PI / 2; // 90 degrees spread for siblings
          
          const angleOffset = spreadAngle * (siblingIndex / (totalSiblings - 1 || 1) - 0.5);
          const baseAngle = Math.atan2(
            (parentNode.fy ?? dimensions.height / 2) - dimensions.height / 2,
            (parentNode.fx ?? dimensions.width / 2) - dimensions.width / 2
          );
          const nodeAngle = baseAngle + angleOffset;
          
          nodes.push({
            id: node.id,
            name: node.name,
            status: node.status,
            group: 2,
            estimatedHours: node.estimatedHours,
            fx: (parentNode.fx ?? dimensions.width / 2) + secondLevelRadius * Math.cos(nodeAngle),
            fy: (parentNode.fy ?? dimensions.height / 2) + secondLevelRadius * Math.sin(nodeAngle),
          });
        }
      } else {
        // If no parent, place it in a row at the bottom
        const bottomY = dimensions.height - 100;
        const spacing = dimensions.width / (secondLevelNodes.length + 1);
        nodes.push({
          id: node.id,
          name: node.name,
          status: node.status,
          group: 2,
          estimatedHours: node.estimatedHours,
          fx: (i + 1) * spacing,
          fy: bottomY,
        });
      }
    });
    
    // Create links
    let links: D3Link[] = [];
    
    // Connect root to first level nodes
    firstLevelNodes.forEach(node => {
      links.push({
        source: rootNodeId,
        target: node.id,
      });
    });
    
    // Add connections based on parent-child relationships
    edges.forEach(edge => {
      links.push({
        source: edge.source,
        target: edge.target,
      });
    });
    
    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);
    
    // Define gradient for links
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#9333EA");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6");
    
    // Create links
    svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "url(#link-gradient)")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.6)
      .attr("x1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode?.fx || 0;
      })
      .attr("y1", d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        return sourceNode?.fy || 0;
      })
      .attr("x2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode?.fx || 0;
      })
      .attr("y2", d => {
        const targetNode = nodes.find(n => n.id === d.target);
        return targetNode?.fy || 0;
      });
    
    // Create node groups
    const node = svg.append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.fx || 0},${d.fy || 0})`)
      .on("click", (event, d) => {
        // Skip if root node
        if (d.id === rootNodeId) {
          return;
        }
        // Find the original node from skillMap
        const originalNode = skillMap.nodes[d.id];
        if (originalNode) {
          onNodeClick(originalNode);
        }
      });
    
    // Node sizes based on importance
    const rootNodeSize = 60;
    const firstLevelNodeSize = 45;
    const secondLevelNodeSize = 40;
    
    // Create gradients for nodes
    createNodeGradient(defs, "root-gradient", "#9333EA", "#3B82F6");
    createNodeGradient(defs, "default-gradient", "#9333EA", "#7E22CE");
    createNodeGradient(defs, "progress-gradient", "#3B82F6", "#1D4ED8");
    createNodeGradient(defs, "completed-gradient", "#22C55E", "#16A34A");
    
    // Node circles
    node.append("circle")
      .attr("r", d => {
        if (d.id === rootNodeId) return rootNodeSize;
        if (d.group === 1) return firstLevelNodeSize;
        return secondLevelNodeSize;
      })
      .attr("fill", d => {
        if (d.id === rootNodeId) return "url(#root-gradient)";
        if (d.status === 'completed') return "url(#completed-gradient)";
        if (d.status === 'in_progress') return "url(#progress-gradient)";
        return "url(#default-gradient)";
      });
    
    // Black inner circle for text background
    node.append("circle")
      .attr("r", d => {
        if (d.id === rootNodeId) return rootNodeSize - 4;
        if (d.group === 1) return firstLevelNodeSize - 4;
        return secondLevelNodeSize - 4;
      })
      .attr("fill", "rgba(0, 0, 0, 0.8)");
    
    // Text labels
    node.append("text")
      .attr("font-size", d => {
        if (d.id === rootNodeId) return "14px";
        if (d.group === 1) return "12px";
        return "11px";
      })
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("dy", 0)
      .each(function(d) {
        const text = d3.select(this);
        const words = d.name.split(/\s+/);
        const lineHeight = 1.1;
        
        // Max width based on node size
        const maxWidth = d.id === rootNodeId ? 
          rootNodeSize * 1.6 : 
          d.group === 1 ? 
            firstLevelNodeSize * 1.6 : 
            secondLevelNodeSize * 1.6;
        
        let line: string[] = [];
        let tspan = text.append("tspan")
          .attr("x", 0)
          .attr("dy", 0);
        
        for (let i = 0; i < words.length; i++) {
          line.push(words[i]);
          tspan.text(line.join(" "));
          
          if ((tspan.node()?.getComputedTextLength() || 0) > maxWidth && line.length > 1) {
            line.pop();
            tspan.text(line.join(" "));
            line = [words[i]];
            tspan = text.append("tspan")
              .attr("x", 0)
              .attr("dy", `${lineHeight}em`)
              .text(words[i]);
          }
        }
        
        // Adjust vertical position of text based on line count
        const lineCount = text.selectAll("tspan").size();
        text.selectAll("tspan").attr("dy", (_, i) => 
          `${i === 0 ? -((lineCount - 1) * lineHeight) / 2 : lineHeight}em`
        );
      });
    
    // Add pulse animation to root node
    node.filter(d => d.id === rootNodeId)
      .append("circle")
      .attr("r", rootNodeSize + 4)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("class", "pulse-circle");
    
    // Add CSS animation for pulsing effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.3); opacity: 0; }
      }
      .pulse-circle {
        animation: pulse 2s infinite;
        transform-origin: center;
        transform-box: fill-box;
      }
    `;
    document.head.appendChild(style);
    
  }, [skillMap, dimensions, onNodeClick]);
  
  function createNodeGradient(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, id: string, color1: string, color2: string) {
    const gradient = defs.append("radialGradient")
      .attr("id", id)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color1);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color2);
  }
  
  return (
    <div className="relative w-full" style={{ height: `${dimensions.height}px` }}>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default D3SkillTree;