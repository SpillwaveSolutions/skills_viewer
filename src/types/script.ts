export interface Script {
  /** Script name or identifier */
  name: string;

  /** Script language: "bash", "python", "javascript", etc. */
  language: string;

  /** Script content */
  content: string;

  /** Line number where script starts in the skill file */
  line_number?: number;
}
