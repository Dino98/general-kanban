
import React, { useEffect, useRef } from 'react';
// Import from node_modules directly with the correct path
import FunnelGraph from 'funnel-graph-js/dist/js/funnel-graph.js';
import 'funnel-graph-js/dist/css/main.min.css';
import 'funnel-graph-js/dist/css/theme.min.css';

interface FunnelData {
  labels: string[];
  colors: string[];
  values: number[][];
  subLabels?: string[];
}

interface FunnelGraphProps {
  data: FunnelData;
  gradientDirection?: 'horizontal' | 'vertical';
  animated?: boolean;
  displayPercent?: boolean;
  direction?: 'horizontal' | 'vertical';
  height?: number;
  width?: number;
}

const FunnelGraphComponent: React.FC<FunnelGraphProps> = ({
  data,
  gradientDirection = 'horizontal',
  animated = true,
  displayPercent = true,
  direction = 'vertical',
  height = 300,
  width = 800,
}) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const graph = useRef<any>(null);

  useEffect(() => {
    // Wait for the DOM to be ready and the ref to be attached
    if (!graphRef.current) {
      console.error('Graph container reference is not available');
      return;
    }
    
    // Clear any previous graph
    if (graphRef.current.firstChild) {
      graphRef.current.innerHTML = '';
    }

    try {
      // Check if we have valid data
      if (!data || !data.values || !data.values.length || !data.values[0].some(value => value > 0)) {
        console.warn('No valid data for funnel graph');
        return;
      }

      // Create a new instance with the current DOM node
      graph.current = new FunnelGraph({
        container: graphRef.current,
        gradientDirection,
        data,
        animated,
        displayPercent,
        direction,
        width,
        height
      });

      // Draw the graph
      graph.current.draw();
      console.log('Funnel graph drawn successfully');
    } catch (error) {
      console.error('Error initializing funnel graph:', error);
    }

    // Cleanup
    return () => {
      if (graph.current) {
        try {
          if (graphRef.current) {
            graphRef.current.innerHTML = '';
          }
        } catch (e) {
          console.error('Error cleaning up funnel graph:', e);
        }
      }
    };
  }, [data, gradientDirection, animated, displayPercent, direction, height, width]);

  return (
    <div 
      ref={graphRef} 
      className="funnel-container w-full"
      style={{ minHeight: `${height}px` }}
      id="funnel-graph-container"
    />
  );
};

export default FunnelGraphComponent;
