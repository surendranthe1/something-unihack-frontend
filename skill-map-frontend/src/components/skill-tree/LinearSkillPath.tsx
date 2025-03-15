// src/components/skill-tree/LinearSkillPath.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SkillMap, SkillNode } from '../../types';
import { Card } from '../ui/card';

interface LinearSkillPathProps {
  skillMap: SkillMap;
  onNodeClick: (node: SkillNode) => void;
}

interface PathNode {
  id: string;
  name: string;
  description: string;
  status: string;
  estimatedHours: number;
  index: number; // Position in the path
}

const LinearSkillPath: React.FC<LinearSkillPathProps> = ({ skillMap, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1.5 }); // Start with 1.5 zoom level
  
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        // Calculate dimensions based on the number of nodes
        const nodeCount = skillMap ? Object.keys(skillMap.nodes).length : 0;
        
        // Make the canvas even larger to accommodate dragging
        const containerWidth = Math.max(1500, nodeCount * 200); // Increased base width
        const containerHeight = Math.max(1200, nodeCount * 150); // Increased base height
        
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [skillMap]);
  
  useEffect(() => {
    if (!skillMap || !svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create a linear path from the skill tree
    const linearPath = createLinearPath(skillMap);
    
    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", [0, 0, dimensions.width, dimensions.height]);
    
    // Create a group that will contain all elements and can be transformed
    const g = svg.append("g")
      .attr("class", "everything");
    
    // Initialize the zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4]) // Allow zooming from 0.5x to 4x (increased max zoom)
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setTransform({ 
          x: event.transform.x, 
          y: event.transform.y, 
          k: event.transform.k 
        });
      });
    
    // Apply zoom behavior to SVG
    svg.call(zoom as any);
    
    // Calculate positions for better initial view
    const nodePositions = calculateDynamicNodePositions(linearPath, dimensions);
    
    // Find a good center point for initial view (average position of first 3 nodes or all if fewer)
    const nodesToCenter = Math.min(linearPath.length, 3);
    const centerX = nodePositions.slice(0, nodesToCenter).reduce((sum, pos) => sum + pos.x, 0) / nodesToCenter;
    const centerY = nodePositions.slice(0, nodesToCenter).reduce((sum, pos) => sum + pos.y, 0) / nodesToCenter;
    
    // Initial transform with higher zoom and centered on first few nodes
    const initialScale = 1.5; // Start with 1.5x zoom
    const initialTransform = d3.zoomIdentity
      .translate(
        dimensions.width / 2 - centerX * initialScale,
        dimensions.height / 3 - centerY * initialScale
      )
      .scale(initialScale);
    
    svg.call((zoom as any).transform, initialTransform);
    
    // Add a subtle grid background for depth
    createGridBackground(g, dimensions);
    
    // Define gradients
    const defs = svg.append("defs");
    
    // Path gradient - broader and more colorful
    const pathGradient = defs.append("linearGradient")
      .attr("id", "path-gradient")
      .attr("gradientUnits", "userSpaceOnUse");
    
    pathGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#9333EA");
    
    pathGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#7E22CE");
    
    pathGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6");
    
    // Node gradients - more 3D with multiple color stops
    create3DNodeGradient(defs, "root-gradient", "#9333EA", "#3B82F6");
    create3DNodeGradient(defs, "default-gradient", "#9333EA", "#7E22CE");
    create3DNodeGradient(defs, "progress-gradient", "#3B82F6", "#1D4ED8");
    create3DNodeGradient(defs, "completed-gradient", "#22C55E", "#16A34A");
    
    // Draw the connecting path with broader, flowing edges
    drawFlowingPath(g, nodePositions, dimensions);
    
    // Draw the nodes
    const nodes = g.selectAll(".node")
      .data(linearPath)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${nodePositions[i].x},${nodePositions[i].y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // Prevent the click from propagating to the zoom behavior
        event.stopPropagation();
        
        const originalNode = skillMap.nodes[d.id];
        if (originalNode) {
          onNodeClick(originalNode);
        }
      });
    
    // Node sizes - significantly larger for better visibility
    const getNodeSize = (d: PathNode) => {
      if (d.index === 0) return 160; // Root node is largest (increased size)
      if (d.index === linearPath.length - 1) return 150; // Final node is second largest
      return 140; // Regular nodes - all larger than before
    };
    
    // 3D effect with multiple layers
    // Shadow/base layer
    nodes.append("circle")
      .attr("r", d => getNodeSize(d))
      .attr("fill", "#000")
      .attr("opacity", 0.4)
      .attr("transform", "translate(4, 4)");
    
    // Main node circle
    nodes.append("circle")
      .attr("class", "main-circle")
      .attr("r", d => getNodeSize(d))
      .attr("fill", d => {
        if (d.index === 0) return "url(#root-gradient)";
        if (d.status === 'completed') return "url(#completed-gradient)";
        if (d.status === 'in_progress') return "url(#progress-gradient)";
        return "url(#default-gradient)";
      })
      .attr("stroke", "rgba(255, 255, 255, 0.7)")
      .attr("stroke-width", 3);
    
    // Inner circle for text background
    nodes.append("circle")
      .attr("r", d => getNodeSize(d) - 10)
      .attr("fill", "rgba(0, 0, 0, 0.5)");
    
    // Highlight rim for 3D effect
    nodes.append("path")
      .attr("d", d => {
        const r = getNodeSize(d);
        return `M ${-r * 0.7},${-r * 0.7} A ${r},${r} 0 0,1 ${r * 0.7},${-r * 0.7}`;
      })
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 4)
      .attr("fill", "none");
    
    // Node text labels - much larger font with better wrapping
    nodes.each(function(d) {
      const node = d3.select(this);
      const nodeSize = getNodeSize(d);
      const words = d.name.split(/\s+/);
      
      // Create text element
      const text = node.append("text")
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("dy", 0)
        .style("font-weight", "bold")
        .style("text-shadow", "0px 2px 3px rgba(0,0,0,0.8)")
        .style("font-family", "ui-sans-serif, system-ui, sans-serif");
      
      // Start with a much larger font size
      let fontSize = d.index === 0 ? 36 : 32; // Significantly increased font sizes
      
      // First attempt: try with single line and large font
      let tspan = text.append("tspan")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", `${fontSize}px`)
        .text(d.name);
      
      // If it doesn't fit, reduce font size until it fits or hits minimum
      const maxWidth = nodeSize * 1.6;
      while ((tspan.node()?.getComputedTextLength() || 0) > maxWidth && fontSize > 24) { // Higher minimum font size
        fontSize -= 1;
        tspan.attr("font-size", `${fontSize}px`);
      }
      
      // If it's still too big, break into multiple lines
      if ((tspan.node()?.getComputedTextLength() || 0) > maxWidth) {
        // Clear and restart with line breaking
        text.selectAll("*").remove();
        
        const lineHeight = 1.2; // Increased line height
        let line: string[] = [];
        let tspan = text.append("tspan")
          .attr("x", 0)
          .attr("dy", 0)
          .attr("font-size", `${fontSize}px`);
        
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
              .attr("font-size", `${fontSize}px`)
              .text(words[i]);
          }
        }
        
        // Adjust vertical position of text based on line count
        const lineCount = text.selectAll("tspan").size();
        text.selectAll("tspan").attr("dy", (_, i) => 
          `${i === 0 ? -((lineCount - 1) * lineHeight) / 2 : lineHeight}em`
        );
      }
    });
    
    // Add node numbers at the bottom center - larger size
    nodes.append("circle")
      .attr("r", 24) // Much larger number circle
      .attr("cy", d => getNodeSize(d) - 15)
      .attr("fill", "rgba(0, 0, 0, 0.7)")
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 2);
    
    nodes.append("text")
      .attr("y", d => getNodeSize(d) - 15)
      .attr("font-size", "22px") // Much larger number text
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-weight", "bold")
      .style("text-shadow", "0px 1px 1px rgba(0,0,0,0.5)")
      .text(d => d.index + 1);
    
    // Add glow animation for the root node
    nodes.filter(d => d.index === 0)
      .append("circle")
      .attr("r", d => getNodeSize(d) + 10)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 4)
      .attr("class", "glow-circle");
    
    // Add CSS animation for glowing effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glow {
        0% { stroke-opacity: 0.2; stroke-width: 3; }
        50% { stroke-opacity: 0.8; stroke-width: 6; }
        100% { stroke-opacity: 0.2; stroke-width: 3; }
      }
      .glow-circle {
        animation: glow 3s infinite;
      }
    `;
    document.head.appendChild(style);
    
    // Add initial drag indicator instructions that fade away
    const instructions = svg.append("g")
      .attr("class", "instructions")
      .style("opacity", 1)
      .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height - 100})`);
    
    instructions.append("rect")
      .attr("x", -150)
      .attr("y", -40)
      .attr("width", 300)
      .attr("height", 80)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "rgba(0, 0, 0, 0.7)")
      .attr("stroke", "rgba(147, 51, 234, 0.5)")
      .attr("stroke-width", 2);
    
    instructions.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("y", -10)
      .attr("font-size", "16px")
      .text("Drag to explore the skill tree");
    
    instructions.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("y", 15)
      .attr("font-size", "14px")
      .text("Scroll to zoom in and out");
    
    // Fade out instructions after 3 seconds
    instructions.transition()
      .delay(3000)
      .duration(1000)
      .style("opacity", 0)
      .remove();
    
  }, [skillMap, dimensions, onNodeClick]);
  
  // Create a more interesting 3D gradient
  function create3DNodeGradient(defs: d3.Selection<SVGDefsElement, unknown, null, undefined>, id: string, color1: string, color2: string) {
    const gradient = defs.append("radialGradient")
      .attr("id", id)
      .attr("cx", "30%")
      .attr("cy", "30%")
      .attr("r", "70%")
      .attr("fx", "30%")
      .attr("fy", "30%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "white");
    
    gradient.append("stop")
      .attr("offset", "20%")
      .attr("stop-color", color1);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color2);
  }
  
  // Create a subtle grid background for depth perception
  function createGridBackground(g: d3.Selection<SVGGElement, unknown, null, undefined>, dimensions: { width: number, height: number }) {
    const gridSize = 40;
    const gridGroup = g.append("g").attr("class", "grid").lower();
    
    // Create a pattern for the grid
    const defs = d3.select("defs") || d3.select("svg").append("defs");
    
    defs.append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .attr("patternUnits", "userSpaceOnUse")
      .append("path")
      .attr("d", `M ${gridSize} 0 L 0 0 0 ${gridSize}`)
      .attr("fill", "none")
      .attr("stroke", "rgba(100, 100, 255, 0.1)")
      .attr("stroke-width", 1);
      
    // Create a background rect with the pattern
    gridGroup.append("rect")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("fill", "url(#grid-pattern)");
  }
  
  // Create a linear path from the skill tree
  function createLinearPath(skillMap: SkillMap): PathNode[] {
    // Find the root node
    const rootNode = Object.values(skillMap.nodes).find(node => !node.parentId);
    if (!rootNode) return [];
    
    // Start with the root node
    const linearPath: PathNode[] = [{
      id: rootNode.id,
      name: rootNode.name,
      description: rootNode.description,
      status: rootNode.status,
      estimatedHours: rootNode.estimatedHours,
      index: 0
    }];
    
    // Function to flatten the tree into a path through DFS
    function traverseChildren(nodeId: string, currentIndex: number): number {
      const currentNode = skillMap.nodes[nodeId];
      if (!currentNode) return currentIndex;
      
      // Process children in order
      if (currentNode.children && currentNode.children.length > 0) {
        for (const childId of currentNode.children) {
          const childNode = skillMap.nodes[childId];
          if (childNode) {
            currentIndex++;
            linearPath.push({
              id: childNode.id,
              name: childNode.name,
              description: childNode.description,
              status: childNode.status,
              estimatedHours: childNode.estimatedHours,
              index: currentIndex
            });
            // Process grandchildren
            currentIndex = traverseChildren(childId, currentIndex);
          }
        }
      }
      
      return currentIndex;
    }
    
    // Start traversal from root node's children
    traverseChildren(rootNode.id, 0);
    
    return linearPath;
  }
  
  // Calculate more dynamic node positions with even spacing
  function calculateDynamicNodePositions(nodes: PathNode[], dimensions: { width: number, height: number }) {
    const positions: { x: number, y: number }[] = [];
    const nodeCount = nodes.length;
    
    // Edge padding
    const padding = 200; // Even more padding for larger nodes
    const availableWidth = dimensions.width - (padding * 2);
    const availableHeight = dimensions.height - (padding * 2);
    
    // Calculate the maximum node size for minimum distance calculations
    const maxNodeSize = 160; // Same as the largest node size
    const minDistance = maxNodeSize * 4; // Ensure nodes are much further apart for larger nodes
    
    // Even node spacing - calculate path length
    // Increase total path length to ensure minimum spacing
    const pathLength = Math.max(
      Math.sqrt(availableWidth * availableWidth + availableHeight * availableHeight) * 1.2,
      minDistance * (nodeCount - 1) // Ensure minimum total path length
    );
    
    // Calculate spacing between nodes
    const segmentLength = Math.max(
      pathLength / (nodeCount - 1 || 1),
      minDistance // Ensure minimum segment length
    );
    
    // Start with the root node positioned more prominently
    positions.push({
      x: dimensions.width / 4,
      y: padding
    });
    
    if (nodeCount > 1) {
      // Create a flowing path with even spacing
      for (let i = 1; i < nodeCount; i++) {
        // Path factor - how far along the path (0 to 1)
        const t = i / (nodeCount - 1);
        
        // Calculate position along a flowing curve
        // Use a combination of sine waves for interesting, but smooth path
        const x = padding + (availableWidth * 0.5) + 
                 (availableWidth * 0.4 * Math.sin(t * Math.PI * 2.5));
        
        // Y-coordinate should always increase to ensure downward flow
        const y = padding + (t * availableHeight * 0.85);
        
        positions.push({ x, y });
      }
      
      // Adjust positions to achieve even spacing while maintaining minimum distance
      // We'll keep the root node fixed and adjust all others
      for (let i = 1; i < positions.length; i++) {
        // Get the angle from previous node to this node
        const prev = positions[i - 1];
        let current = positions[i];
        let angle = Math.atan2(current.y - prev.y, current.x - prev.x);
        
        // Set position at exact distance along that angle
        current = {
          x: prev.x + Math.cos(angle) * segmentLength,
          y: prev.y + Math.sin(angle) * segmentLength
        };
        positions[i] = current;
      }
      
      // Perform another pass to ensure no nodes overlap with any other nodes
      // This addresses potential overlaps between non-consecutive nodes
      const iterations = 5; // Number of refinement iterations
      for (let iter = 0; iter < iterations; iter++) {
        let moved = false;
        
        for (let i = 0; i < positions.length; i++) {
          for (let j = 0; j < positions.length; j++) {
            if (i !== j) {
              const dx = positions[j].x - positions[i].x;
              const dy = positions[j].y - positions[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < minDistance) {
                moved = true;
                const angle = Math.atan2(dy, dx);
                const adjustment = (minDistance - distance) / 2;
                
                // Don't move the root node
                if (i !== 0) {
                  positions[i].x -= Math.cos(angle) * adjustment;
                  positions[i].y -= Math.sin(angle) * adjustment;
                }
                
                if (j !== 0) {
                  positions[j].x += Math.cos(angle) * adjustment;
                  positions[j].y += Math.sin(angle) * adjustment;
                }
              }
            }
          }
        }
        
        // If no nodes were moved in this iteration, we're done
        if (!moved) break;
      }
      
      // Final adjustment to ensure nodes stay within boundaries
      for (let i = 0; i < positions.length; i++) {
        positions[i].x = Math.max(padding, Math.min(dimensions.width - padding, positions[i].x));
        positions[i].y = Math.max(padding, Math.min(dimensions.height - padding, positions[i].y));
      }
    }
    
    return positions;
  }
  
  // Draw flowing path with broad edges
  function drawFlowingPath(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    positions: { x: number, y: number }[],
    dimensions: { width: number, height: number }
  ) {
    if (positions.length < 2) return;
    
    // Create a group for all path segments
    const pathGroup = g.append("g").attr("class", "paths").lower();
    
    // Draw broader connections between nodes
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      
      // Calculate control points for a more natural curve
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Control point offsets depend on distance
      const offset = Math.min(distance * 0.5, 200);
      
      let controlPoints;
      
      // Different curve types for variety
      if (i % 3 === 0) {
        // S-curve
        controlPoints = [
          { x: start.x + dx * 0.1, y: start.y + offset },
          { x: end.x - dx * 0.1, y: end.y - offset }
        ];
      } else if (i % 3 === 1) {
        // Arc curve
        controlPoints = [
          { x: start.x + dx * 0.5, y: start.y - offset * 0.3 },
          { x: start.x + dx * 0.5, y: end.y + offset * 0.3 }
        ];
      } else {
        // Smooth curve
        controlPoints = [
          { x: start.x + dx * 0.5, y: start.y },
          { x: end.x - dx * 0.5, y: end.y }
        ];
      }
      
      // Create path
      const path = `
        M ${start.x} ${start.y}
        C ${controlPoints[0].x} ${controlPoints[0].y},
          ${controlPoints[1].x} ${controlPoints[1].y},
          ${end.x} ${end.y}
      `;
      
      // Draw path with broader edge
      pathGroup.append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "url(#path-gradient)")
        .attr("stroke-width", 28) // Much broader path for larger nodes
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linecap", "round")
        .attr("filter", "drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.3))");
        
      // Add glow effect
      pathGroup.append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 6) // Enhanced glow
        .attr("stroke-opacity", 0.7)
        .attr("stroke-linecap", "round")
        .attr("filter", "blur(4px)");
    }
  }
  
  return (
    <div className="relative w-full h-full" style={{ overflow: 'hidden' }}>
      <Card className="absolute right-4 top-4 p-3 z-10 bg-black/60 border-purple-700/50 text-white text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
            <span>Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-700"></div>
            <span>Completed</span>
          </div>
        </div>
      </Card>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default LinearSkillPath;