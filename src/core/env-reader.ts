// src/core/env-reader.ts

import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

export interface EnvFiles {
  env: Record<string, string>;
  example: Record<string, string>;
}

/**
 * Safely reads and parses .env and .env.example files from the target directory.
 * Returns empty objects if the files do not exist, preventing crashes.
 */
export async function readEnvFiles(cwd: string): Promise<EnvFiles> {
  const envPath = path.join(cwd, ".env");
  const examplePath = path.join(cwd, ".env.example");

  let envContent = "";
  let exampleContent = "";

  // Graceful degradation: if the file doesn't exist, we just catch the error and keep the empty string
  try {
    envContent = await fs.readFile(envPath, "utf-8");
  } catch (error) {
    // .env not found
  }

  try {
    exampleContent = await fs.readFile(examplePath, "utf-8");
  } catch (error) {
    // .env.example not found
  }

  return {
    env: dotenv.parse(envContent || ""),
    example: dotenv.parse(exampleContent || ""),
  };
}