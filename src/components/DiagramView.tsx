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
  // Handler for navigating to references
  const handleNavigateToReference = (path: string) => {
    console.log('Navigate to reference:', path);
    // TODO: Implement navigation to reference file
    // This could open the reference in a modal or switch to references tab
  };

  // Handler for navigating to scripts
  const handleNavigateToScript = (name: string) => {
    console.log('Navigate to script:', name);
    // TODO: Implement navigation to script
    // This could scroll to the script in the scripts tab
  };

  return (
    <InteractiveDiagram
      skill={skill}
      onNavigateToReference={handleNavigateToReference}
      onNavigateToScript={handleNavigateToScript}
    />
  );
};
