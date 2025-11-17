/**
 * TypeScript Interface Contracts for Diagram Toolbar Component
 *
 * Feature: 018-diagram-toolbar-redesign
 * Purpose: Define prop interfaces for DiagramToolbar extracted component
 *
 * These contracts ensure type safety and clear API boundaries between
 * InteractiveDiagram (parent) and DiagramToolbar (child) components.
 */

/**
 * Diagram layout direction
 * - TD: Top-Down (vertical flow)
 * - LR: Left-Right (horizontal flow)
 */
export type DiagramLayout = 'TD' | 'LR';

/**
 * Main props interface for DiagramToolbar component
 *
 * This interface defines all required props for the toolbar,
 * grouped by functionality (layout, zoom, export, regenerate).
 */
export interface DiagramToolbarProps {
  // === Layout Controls ===

  /**
   * Current diagram layout direction
   */
  layout: DiagramLayout;

  /**
   * Callback when user changes layout direction
   * @param layout - New layout direction (TD or LR)
   */
  onLayoutChange: (layout: DiagramLayout) => void;

  // === Zoom Controls ===

  /**
   * Current zoom level (1.0 = 100%, 0.5 = 50%, 2.0 = 200%)
   * Range: 0.1 to 5.0
   */
  zoom: number;

  /**
   * Callback to zoom in (multiply current zoom by 1.2)
   */
  onZoomIn: () => void;

  /**
   * Callback to zoom out (divide current zoom by 1.2)
   */
  onZoomOut: () => void;

  /**
   * Callback to reset zoom to 100% (zoom = 1.0)
   */
  onResetZoom: () => void;

  /**
   * Callback to fit diagram to viewport
   * Automatically calculates optimal zoom level
   */
  onFitToView: () => void;

  // === Export Controls ===

  /**
   * SVG content for export
   * Empty string if diagram not yet rendered
   */
  svgContent: string;

  /**
   * Mermaid source code for export
   * Empty string if diagram not yet generated
   */
  mermaidSource: string;

  /**
   * Callback to download diagram as SVG file
   * Creates blob and triggers browser download
   */
  onDownloadSVG: () => void;

  /**
   * Callback to download Mermaid source as .mmd file
   * Creates blob and triggers browser download
   */
  onDownloadMermaid: () => void;

  // === Regenerate Control ===

  /**
   * True if diagram is currently being rendered by Rust backend
   * Used to show loading state and disable regenerate button
   */
  isLoading: boolean;

  /**
   * Callback to force regenerate diagram (bypass cache)
   * Invokes Rust backend to re-render Mermaid to SVG
   */
  onRegenerate: () => void;

  // === Context ===

  /**
   * Name of current skill (for download filenames)
   * Used to generate: "{skillName}-diagram.svg" and "{skillName}-diagram.mmd"
   */
  skillName: string;
}

/**
 * Props for individual button groups (for future extraction)
 * Defines common accessibility props for button containers
 */
export interface ButtonGroupProps {
  /**
   * Accessible label for the button group
   * Announced by screen readers when group receives focus
   */
  'aria-label': string;

  /**
   * Optional ARIA role (default: 'group')
   * Use 'toolbar' for top-level toolbar container
   */
  role?: string;

  /**
   * Child buttons/elements
   */
  children: React.ReactNode;
}

/**
 * Props for zoom control buttons
 * Handles disabled state based on zoom limits
 */
export interface ZoomButtonProps {
  /**
   * Click handler for zoom action
   */
  onClick: () => void;

  /**
   * True when button should be disabled
   * (e.g., zoom in disabled at max zoom, zoom out disabled at min zoom)
   */
  disabled?: boolean;

  /**
   * Accessible label for screen readers
   */
  'aria-label': string;

  /**
   * Tooltip text shown on hover
   * Should change based on disabled state
   * Example: "Zoom in (Ctrl++)" or "Maximum zoom reached"
   */
  title: string;

  /**
   * Button content (usually +, −, or percentage)
   */
  children: React.ReactNode;
}

/**
 * Zoom limits (constants referenced in prop descriptions)
 */
export const ZOOM_LIMITS = {
  MIN: 0.1, // 10% minimum zoom
  MAX: 5.0, // 500% maximum zoom
  DEFAULT: 1.0, // 100% default zoom
  STEP: 1.2, // 20% zoom in/out increment
} as const;

/**
 * Export format types (for future expansion)
 */
export type ExportFormat = 'svg' | 'mmd' | 'png'; // png future enhancement

/**
 * Toolbar button variant types
 * Maps to TailwindCSS color schemes
 */
export type ButtonVariant =
  | 'primary' // Purple accent (bg-purple-600)
  | 'secondary' // Blue (bg-blue-600)
  | 'tertiary' // Gray (bg-gray-600)
  | 'outline'; // Border only (border-gray-300)

/**
 * Helper type for export button configuration
 */
export interface ExportButtonConfig {
  label: string;
  format: ExportFormat;
  variant: ButtonVariant;
  disabled: boolean;
  onClick: () => void;
}
