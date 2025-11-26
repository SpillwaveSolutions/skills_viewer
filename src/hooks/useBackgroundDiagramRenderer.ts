import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../types';
import { generateSkillDiagram, DiagramLayout } from '../utils/diagramGenerator';
import { useDiagramCacheStore } from '../stores/diagramCacheStore';
import { backgroundLogger as logger } from '../utils/logger';

const LAYOUTS_TO_CACHE: DiagramLayout[] = ['TD', 'LR']; // Cache both common layouts
const RENDER_DELAY_MS = 500; // Delay between renders to avoid overwhelming the backend

/**
 * Background diagram renderer hook
 * Progressively renders and caches diagrams for all skills in the background
 */
export const useBackgroundDiagramRenderer = (skills: Skill[]) => {
  const {
    getCachedSVG,
    setCachedSVG,
    renderQueue,
    currentlyRendering,
    addToQueue,
    setCurrentlyRendering,
    removeFromQueue,
    getNextInQueue,
    setBackgroundError,
  } = useDiagramCacheStore();

  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRenderingRef = useRef(false);

  // Initialize queue with all skills on mount
  useEffect(() => {
    if (skills.length > 0) {
      const skillNames = skills.map((skill) => skill.name);
      addToQueue(skillNames);
      logger.info(`Added ${skillNames.length} skills to background render queue`);
    }
  }, [skills, addToQueue]);

  // Background rendering worker
  useEffect(() => {
    const renderNext = async () => {
      // Don't start new render if already rendering
      if (isRenderingRef.current || currentlyRendering) {
        return;
      }

      const nextSkillName = getNextInQueue();
      if (!nextSkillName) {
        logger.info('Background diagram rendering complete');
        return;
      }

      const skill = skills.find((s) => s.name === nextSkillName);
      if (!skill) {
        removeFromQueue(nextSkillName);
        return;
      }

      // Check if all layouts are already cached
      const allCached = LAYOUTS_TO_CACHE.every(
        (layout) => getCachedSVG(skill.name, layout) !== null
      );
      if (allCached) {
        logger.debug(`Skipping ${skill.name} - all layouts already cached`);
        removeFromQueue(nextSkillName);
        // Schedule next render
        renderTimeoutRef.current = setTimeout(renderNext, 100);
        return;
      }

      // Mark as currently rendering
      isRenderingRef.current = true;
      setCurrentlyRendering(nextSkillName);

      logger.debug(`Rendering diagrams for: ${skill.name}`);

      // Render all layouts for this skill
      for (const layout of LAYOUTS_TO_CACHE) {
        // Skip if already cached
        if (getCachedSVG(skill.name, layout)) {
          logger.debug(`  ${layout} already cached`);
          continue;
        }

        try {
          const mermaidSource = generateSkillDiagram(skill, layout);
          const svg = await invoke<string>('render_mermaid_to_svg', {
            mermaidCode: mermaidSource,
          });

          setCachedSVG(skill.name, layout, svg, mermaidSource);
          logger.debug(`  ${layout} layout cached (${(svg.length / 1024).toFixed(1)}KB)`);
        } catch (error) {
          const errorMsg = `Failed to render ${layout} for ${skill.name}`;
          logger.error(errorMsg, error);
          setBackgroundError(errorMsg);
        }
      }

      // Remove from queue and clear current
      removeFromQueue(nextSkillName);
      setCurrentlyRendering(null);
      isRenderingRef.current = false;

      // Schedule next render with delay
      renderTimeoutRef.current = setTimeout(renderNext, RENDER_DELAY_MS);
    };

    // Start rendering if there's something in the queue
    if (renderQueue.length > 0 && !isRenderingRef.current) {
      renderTimeoutRef.current = setTimeout(renderNext, RENDER_DELAY_MS);
    }

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [
    skills,
    renderQueue,
    currentlyRendering,
    getCachedSVG,
    setCachedSVG,
    setCurrentlyRendering,
    removeFromQueue,
    getNextInQueue,
    setBackgroundError,
  ]);

  return {
    queueLength: renderQueue.length,
    currentlyRendering,
  };
};
