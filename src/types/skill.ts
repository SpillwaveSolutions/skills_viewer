import { Reference } from './reference';
import { Script } from './script';

export interface Skill {
  /** Skill name (from filename or metadata) */
  name: string;

  /** Description from YAML frontmatter or first paragraph */
  description?: string;

  /** Location: "claude" or "opencode" */
  location: string;

  /** Full filesystem path to the skill file */
  path: string;

  /** File content (full markdown including YAML frontmatter) */
  content: string;

  /** Clean markdown content without YAML frontmatter */
  content_clean: string;

  /** List of references loaded by this skill */
  references: Reference[];

  /** List of scripts included in this skill */
  scripts: Script[];

  /** YAML frontmatter metadata */
  metadata?: Record<string, any>;
}
