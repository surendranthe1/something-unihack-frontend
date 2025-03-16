// src/components/skill-program/DailyTaskPath.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { SkillProgram, DailyTask } from '../../types';
import { Card } from '../ui/card';

interface DailyTaskPathProps {
  skillProgram: SkillProgram;
  onTaskClick: (task: DailyTask) => void;
}

interface PathTask {
  day: number;
  name: string;
  description: string;
  status: string;
  estimatedHours: number;
  difficultyLevel: string;
}

const DailyTaskPath: React.FC<DailyTaskPathProps> = ({ skillProgram, onTaskClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  // Increased dimensions for more space
  const [dimensions, setDimensions] = useState({ width: 800, height: 1200 });
  // Higher initial zoom level for smaller nodes but zoomed in view
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 2.8 }); 
  
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const containerWidth = Math.max(2000, 30 * 220);
        // Much taller container for more vertical space
        const containerHeight = Math.max(2800, 30 * 180);
        
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [skillProgram]);
  
  useEffect(() => {
    if (!skillProgram || !svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Convert dailyTasks to a format suitable for visualization
    const tasks: PathTask[] = skillProgram.dailyTasks.map(task => ({
      day: task.day,
      name: task.name, // This will be the AI-generated name
      description: task.description,
      status: task.status,
      estimatedHours: task.estimatedHours,
      difficultyLevel: task.difficultyLevel
    }));
    
    // Sort tasks by day to ensure correct order
    tasks.sort((a, b) => a.day - b.day);
    
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
      .scaleExtent([0.5, 5]) // Allow zooming from 0.5x to 5x
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
    
    // Calculate positions for a distinct S curve
    const positions = calculateSCurvePositions(tasks, dimensions);
    
    // Find a good center point for initial view (focus on first node)
    const centerX = positions[0].x;
    const centerY = positions[0].y;
    
    // Initial transform with higher zoom and centered on first node
    const initialScale = 2.8; // Higher initial zoom for zoomed-in view of smaller nodes
    const initialTransform = d3.zoomIdentity
      .translate(
        dimensions.width / 2 - centerX * initialScale,
        dimensions.height / 5 - centerY * initialScale
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
    
    // Difficulty level gradients - vibrant and distinct colors
    // Beginner (Green)
    create3DNodeGradient(defs, "beginner-gradient", "#10B981", "#059669");
    // Intermediate (Blue)
    create3DNodeGradient(defs, "intermediate-gradient", "#3B82F6", "#2563EB");
    // Advanced (Purple)
    create3DNodeGradient(defs, "advanced-gradient", "#8B5CF6", "#7C3AED");
    
    // Status gradients - clear distinction from difficulty colors
    // Not Started (Gray)
    create3DNodeGradient(defs, "not-started-gradient", "#6B7280", "#4B5563");
    // In Progress (Yellow/Orange)
    create3DNodeGradient(defs, "in-progress-gradient", "#F59E0B", "#D97706");
    // Completed (Pink/Red)
    create3DNodeGradient(defs, "completed-gradient", "#EC4899", "#DB2777");
    
    // Draw the connecting path
    drawFlowingPath(g, positions, dimensions);
    
    // Draw the task nodes
    const nodes = g.selectAll(".node")
      .data(tasks)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d, i) => `translate(${positions[i].x},${positions[i].y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // Prevent the click from propagating to the zoom behavior
        event.stopPropagation();
        
        // Find the original task by day
        const originalTask = skillProgram.dailyTasks.find(task => task.day === d.day);
        if (originalTask) {
          onTaskClick(originalTask);
        }
      });
    
    // Node sizes - smaller but clearly visible
    const getNodeSize = (d: PathTask) => {
      if (d.day === 1) return 130; // First day (smaller now)
      if (d.day === 30) return 130; // Last day (smaller now)
      return 120; // Regular nodes (smaller now)
    };
    
    // Create visual layers for each node
    
    // Shadow/base layer
    nodes.append("circle")
      .attr("r", d => getNodeSize(d))
      .attr("fill", "#000")
      .attr("opacity", 0.4)
      .attr("transform", "translate(5, 5)");
    
    // Main difficulty level circle - using difficulty level colors
    nodes.append("circle")
      .attr("class", "difficulty-circle")
      .attr("r", d => getNodeSize(d))
      .attr("fill", d => {
        const diffLevel = d.difficultyLevel.toLowerCase();
        if (diffLevel === 'beginner') return "url(#beginner-gradient)";
        if (diffLevel === 'intermediate') return "url(#intermediate-gradient)";
        if (diffLevel === 'advanced') return "url(#advanced-gradient)";
        return "url(#beginner-gradient)"; // Default
      })
      .attr("stroke", "rgba(255, 255, 255, 0.7)")
      .attr("stroke-width", 4);
    
    // Inner circle for background
    nodes.append("circle")
      .attr("r", d => getNodeSize(d) - 15)
      .attr("fill", "rgba(0, 0, 0, 0.5)");
    
    // Status indicator ring - ring that shows completion status
    nodes.append("circle")
      .attr("class", "status-ring")
      .attr("r", d => getNodeSize(d) - 35)
      .attr("fill", "none")
      .attr("stroke", d => {
        if (d.status === 'completed') return "url(#completed-gradient)";
        if (d.status === 'in_progress') return "url(#in-progress-gradient)";
        return "url(#not-started-gradient)";
      })
      .attr("stroke-width", 10);
    
    // Highlight rim for 3D effect
    nodes.append("path")
      .attr("d", d => {
        const r = getNodeSize(d);
        return `M ${-r * 0.7},${-r * 0.7} A ${r},${r} 0 0,1 ${r * 0.7},${-r * 0.7}`;
      })
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 5)
      .attr("fill", "none");
    
    // Node text labels - adjusted for smaller nodes
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
      
      // Start with a smaller font size for smaller nodes
      let fontSize = 24;
      
      // First attempt: try with single line and font
      let tspan = text.append("tspan")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", `${fontSize}px`)
        .text(d.name);
      
      // If it doesn't fit, reduce font size until it fits or hits minimum
      const maxWidth = nodeSize * 1.6;
      while ((tspan.node()?.getComputedTextLength() || 0) > maxWidth && fontSize > 16) {
        fontSize -= 1;
        tspan.attr("font-size", `${fontSize}px`);
      }
      
      // If it's still too big, break into multiple lines
      if ((tspan.node()?.getComputedTextLength() || 0) > maxWidth) {
        // Clear and restart with line breaking
        text.selectAll("*").remove();
        
        const lineHeight = 1.2; // Line height
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
    
    // Add day numbers (smaller and less intrusive)
    nodes.append("circle")
      .attr("r", 18) // Smaller day number circle
      .attr("cy", d => getNodeSize(d) - 20)
      .attr("fill", "rgba(0, 0, 0, 0.7)")
      .attr("stroke", "rgba(255, 255, 255, 0.8)")
      .attr("stroke-width", 2);
    
    nodes.append("text")
      .attr("y", d => getNodeSize(d) - 20)
      .attr("font-size", "14px") // Smaller day number text
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-weight", "bold")
      .style("text-shadow", "0px 1px 1px rgba(0,0,0,0.5)")
      .text(d => d.day); // Just the number, no "Day" text
    
    // Add glow animation for the first day
    nodes.filter(d => d.day === 1)
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
      .text("Drag to explore your skill path");
    
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
    
  }, [skillProgram, dimensions, onTaskClick]);
  
  // Create a 3D gradient with highlights
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
    const gridSize = 60; // Adjusted grid size
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
  
  // Calculate positions for a distinct S-curve layout
  function calculateSCurvePositions(tasks: PathTask[], dimensions: { width: number, height: number }) {
    const positions: { x: number, y: number }[] = [];
    const nodeCount = tasks.length;
    
    // Edge padding
    const padding = 300;
    const availableWidth = dimensions.width - (padding * 2);
    const availableHeight = dimensions.height - (padding * 2);
    
    // Parameters for S-curve
    const horizontalSections = 5; // Number of horizontal sections in the S curve
    const xSpacing = availableWidth / (horizontalSections - 1);
    const ySpacing = availableHeight / (nodeCount / horizontalSections);
    
    // Nodes per section
    const nodesPerSection = Math.ceil(nodeCount / horizontalSections);
    
    // Generate basic S-curve positions
    let currentSection = 0;
    let yPosition = padding;
    
    for (let i = 0; i < nodeCount; i++) {
      if (i > 0 && i % nodesPerSection === 0) {
        currentSection++;
      }
      
      // Determine direction (left-to-right or right-to-left)
      const isLeftToRight = currentSection % 2 === 0;
      
      // Calculate x position based on section
      let xBase = padding;
      if (isLeftToRight) {
        xBase = padding + (currentSection * xSpacing);
      } else {
        xBase = padding + ((horizontalSections - 1 - currentSection) * xSpacing);
      }
      
      // Add slight x variation within section for more natural flow
      const xVariation = (i % nodesPerSection) / nodesPerSection * xSpacing * 0.8;
      const x = isLeftToRight ? xBase + xVariation : xBase - xVariation;
      
      // Calculate y position (always top to bottom)
      const y = yPosition;
      yPosition += ySpacing;
      
      positions.push({ x, y });
    }
    
    // Minimum node size for spacing calculations
    const nodeSize = 130;
    const minDistance = nodeSize * 2.2;
    
    // Apply force-directed spacing to maintain minimum distances
    const iterations = 15; 
    for (let iter = 0; iter < iterations; iter++) {
      let moved = false;
      
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[j].x - positions[i].x;
          const dy = positions[j].y - positions[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < minDistance) {
            moved = true;
            const angle = Math.atan2(dy, dx);
            const moveDistance = (minDistance - distance) / 2;
            
            // Move nodes away from each other
            positions[i].x -= Math.cos(angle) * moveDistance;
            positions[i].y -= Math.sin(angle) * moveDistance;
            positions[j].x += Math.cos(angle) * moveDistance;
            positions[j].y += Math.sin(angle) * moveDistance;
          }
        }
      }
      
      if (!moved) break;
      
      // Ensure nodes stay within bounds
      for (let i = 0; i < positions.length; i++) {
        positions[i].x = Math.max(padding, Math.min(dimensions.width - padding, positions[i].x));
        positions[i].y = Math.max(padding, Math.min(dimensions.height - padding, positions[i].y));
      }
    }
    
    return positions;
  }
  
  // Draw flowing path connecting the nodes
  function drawFlowingPath(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    positions: { x: number, y: number }[],
    dimensions: { width: number, height: number }
  ) {
    if (positions.length < 2) return;
    
    // Create a group for all path segments
    const pathGroup = g.append("g").attr("class", "paths").lower();
    
    // Draw connections between nodes
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      
      // Calculate control points for a natural curve
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Control point offsets for smoother curves
      const offset = Math.min(distance * 0.4, 150);
      
      let controlPoints;
      
      // Different curve types for variety
      if (i % 6 === 0) {
        // S-curve
        controlPoints = [
          { x: start.x + dx * 0.1, y: start.y + offset * 0.5 },
          { x: end.x - dx * 0.1, y: end.y - offset * 0.5 }
        ];
      } else if (i % 6 === 3) {
        // Arc curve
        controlPoints = [
          { x: start.x + dx * 0.5, y: start.y - offset * 0.3 },
          { x: start.x + dx * 0.5, y: end.y + offset * 0.3 }
        ];
      } else {
        // Direct smooth curve
        controlPoints = [
          { x: start.x + dx * 0.3, y: start.y },
          { x: start.x + dx * 0.7, y: end.y }
        ];
      }
      
      // Create path
      const path = `
        M ${start.x} ${start.y}
        C ${controlPoints[0].x} ${controlPoints[0].y},
          ${controlPoints[1].x} ${controlPoints[1].y},
          ${end.x} ${end.y}
      `;
      
      // Draw path with broad edge
      pathGroup.append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "url(#path-gradient)")
        .attr("stroke-width", 25) // Thicker path
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
    <div className="relative w-full h-full" style={{ overflow: 'hidden', height: '90vh' }}>
      <Card className="absolute right-4 top-4 p-3 z-10 bg-black/60 border-purple-700/50 text-white text-sm">
        <h5 className="font-medium mb-1">Difficulty Levels:</h5>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-700"></div>
            <span>Beginner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <span>Intermediate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
            <span>Advanced</span>
          </div>
        </div>
        
        <h5 className="font-medium mb-1">Task Status:</h5>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-700"></div>
            <span>Not Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-700"></div>
            <span>Completed</span>
          </div>
        </div>
      </Card>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default DailyTaskPath;