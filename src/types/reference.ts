export interface Reference {
  /** File path or pattern */
  path: string;

  /** Reference type: "file", "glob", or "directory" */
  ref_type: string;

  /** Whether this is a required reference */
  required: boolean;
}
