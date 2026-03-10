// src/core/file-scanner.ts

import fg from "fast-glob";
import fs from "fs/promises";
import { extractVariables } from "./env-parser.js";

export interface ScanOptions {
  cwd: string;
  ignorePatterns?: string[];
}

/**
 * Scans the project directory for source code files and extracts unique environment variables.
 * Upgraded to accept dynamic ignore flags from the CLI.
 */
export async function scanProject(options: ScanOptions): Promise<Set<string>> {
  const defaultIgnore = [
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**"
  ];

  // Merge default ignores with user-provided ignores
  const ignore = options.ignorePatterns && options.ignorePatterns.length > 0
    ? [...defaultIgnore, ...options.ignorePatterns]
    : defaultIgnore;

  const files = await fg(["**/*.{js,ts,jsx,tsx,cjs,mjs,vue,svelte}"], {
    cwd: options.cwd,
    ignore,
    absolute: true,
    onlyFiles: true,
  });

  const allVariables = new Set<string>();

  const readPromises = files.map(async (filePath) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const fileVariables = extractVariables(content);
      
      fileVariables.forEach((variable) => allVariables.add(variable));
    } catch (error) {
      // Graceful degradation for unreadable files
    }
  });

  await Promise.all(readPromises);

  return allVariables;
}