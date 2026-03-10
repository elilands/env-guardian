// src/core/env-parser.ts

/**
 * Extracts environment variables from raw file content using a highly optimized Regex.
 * Upgraded to flawlessly support standard and optional chaining in both dot and bracket notations.
 */
export function extractVariables(fileContent: string): Set<string> {
    const variables = new Set<string>();
    
    // Advanced Regex Engine:
    // Branch 1: (?:\?\.|\.) matches either '?.' or '.' followed by a standard variable name.
    // Branch 2: (?:\?\.)?\[['"] matches an optional '?.' followed by bracket notation [' or ["
    const regex = /process\.env(?:(?:\?\.|\.)([a-zA-Z_][a-zA-Z0-9_]*)|(?:\?\.)?\[['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\])/g;
  
    let match: RegExpExecArray | null;
  
    while ((match = regex.exec(fileContent)) !== null) {
      // match[1] captures dot notation, match[2] captures bracket notation
      const variableName = match[1] || match[2];
      
      if (variableName) {
        variables.add(variableName);
      }
    }
  
    return variables;
  }