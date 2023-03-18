export interface ParsedExecutorInterface {
    parseArgs?: Record<string, string | string[]>;
    stacks?: string[];
    sourceRoot: string;
    root: string;
    env?: Record<string, string>;
  }