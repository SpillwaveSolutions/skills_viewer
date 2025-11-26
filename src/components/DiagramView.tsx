import React from 'react';
import { Skill } from '../types';
import { InteractiveDiagram } from './diagram/InteractiveDiagram';

interface DiagramViewProps {
  skill: Skill;
}

/**
 * DiagramView component - wrapper around InteractiveDiagram
 * Provides backward compatibility with existing code
 */
export const DiagramView: React.FC<DiagramViewProps> = ({ skill }) => {
  // Handler for navigating to references (placeholder for future feature)
  const handleNavigateToReference = (_path: string) => {
    // Future: Navigate to reference file or switch to references tab
  };

  // Handler for navigating to scripts (placeholder for future feature)
  const handleNavigateToScript = (_name: string) => {
    // Future: Navigate to script in scripts tab
  };

  return (
    <InteractiveDiagram
      skill={skill}
      onNavigateToReference={handleNavigateToReference}
      onNavigateToScript={handleNavigateToScript}
    />
  );
};
