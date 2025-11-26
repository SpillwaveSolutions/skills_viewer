import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Skill } from '../types';
import { generateSkillDiagram, DiagramLayout } from '../utils/diagramGenerator';
import { useDiagramCacheStore } from '../stores/diagramCacheStore';
import { backgroundLogger as logger } from '../utils/logger';

const LAYOUTS_TO_CACHE: DiagramLayout[] = ['TD', 'LR']; // Cache both common layouts
const RENDER_DELAY_MS = 1000; // Delay between renders to avoid overwhelming the backend

/**
 * Background diagram renderer hook
 * Progressively renders and caches diagrams for all skills in the background
 *
 * IMPORTANT: This hook is designed to NOT cause React re-renders during background work.
 * It uses refs and direct store access (getState()) instead of subscribed state.
 */
export const useBackgroundDiagramRenderer = (skills: Skill[]) => {
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRenderingRef = useRef(false);
  const skillsRef = useRef<Skill[]>(skills);
  const isInitializedRef = useRef(false);

  // Keep skills ref updated without causing re-renders
  useEffect(() => {
    skillsRef.current = skills;
  }, [skills]);

  // Initialize and run background rendering
  useEffect(() => {
    // Schedule next processing with cleanup tracking
    const scheduleNext = (delayMs: number) => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      renderTimeoutRef.current = setTimeout(() => {
        processNextInQueue();
      }, delayMs);
    };

    // Background rendering worker - runs independently of React render cycle
    const processNextInQueue = async () => {
      // Access store directly without subscribing (no re-renders!)
      const store = useDiagramCacheStore.getState();

      // Don't start if already rendering
      if (isRenderingRef.current) {
        return;
      }

      // Get next item from queue (priority first, then regular)
      const nextSkillName = store.getNextInQueue();
      if (!nextSkillName) {
        // Queue empty - we're done
        logger.info('Background diagram rendering complete');
        store.setCurrentlyRendering(null);
        return;
      }

      const skill = skillsRef.current.find((s) => s.name === nextSkillName);
      if (!skill) {
        // Skill not found, skip and continue
        store.removeFromQueue(nextSkillName);
        scheduleNext(100);
        return;
      }

      // Check if all layouts are already cached
      const allCached = LAYOUTS_TO_CACHE.every(
        (layout) => store.getCachedSVG(skill.name, layout) !== null
      );
      if (allCached) {
        logger.debug(`Skipping ${skill.name} - all layouts already cached`);
        store.removeFromQueue(nextSkillName);
        scheduleNext(100);
        return;
      }

      // Mark as currently rendering
      isRenderingRef.current = true;
      store.setCurrentlyRendering(nextSkillName);

      logger.debug(`Rendering diagrams for: ${skill.name}`);

      // Render all layouts for this skill
      for (const layout of LAYOUTS_TO_CACHE) {
        // Skip if already cached
        if (store.getCachedSVG(skill.name, layout)) {
          logger.debug(`  ${layout} already cached`);
          continue;
        }

        try {
          // Generate mermaid source (this is fast, just string building)
          const mermaidSource = generateSkillDiagram(skill, layout);

          // Send to Rust backend for rendering (the heavy work)
          const svg = await invoke<string>('render_mermaid_to_svg', {
            mermaidCode: mermaidSource,
          });

          // Cache the result
          store.setCachedSVG(skill.name, layout, svg, mermaidSource);
          logger.debug(`  ${layout} layout cached (${(svg.length / 1024).toFixed(1)}KB)`);
        } catch (error) {
          const errorMsg = `Failed to render ${layout} for ${skill.name}`;
          logger.error(errorMsg, error);
          store.setBackgroundError(errorMsg);
        }
      }

      // Done with this skill
      store.removeFromQueue(nextSkillName);
      isRenderingRef.current = false;

      // Schedule next render with delay (let UI breathe)
      scheduleNext(RENDER_DELAY_MS);
    };

    // Initialize queue once when skills are loaded
    if (skills.length > 0 && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const store = useDiagramCacheStore.getState();
      const skillNames = skills.map((skill) => skill.name);
      store.addToQueue(skillNames);
      logger.info(`Added ${skillNames.length} skills to background render queue`);

      // Start processing after a short delay to let UI settle
      scheduleNext(2000);
    }

    // Cleanup on unmount
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
    };
  }, [skills]);

  // Return minimal info for status display (these are the only subscriptions)
  const queueLength = useDiagramCacheStore((state) => state.renderQueue.length);
  const currentlyRendering = useDiagramCacheStore((state) => state.currentlyRendering);

  return {
    queueLength,
    currentlyRendering,
  };
};
