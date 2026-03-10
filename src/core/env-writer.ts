// src/core/env-writer.ts

import fs from "fs/promises";
import path from "path";

/**
 * Safely appends missing variables to the .env.example file.
 * Creates the file if it does not exist.
 * Preserves existing content and comments.
 */
export async function syncEnvExample(cwd: string, missingVars: string[]): Promise<void> {
  if (missingVars.length === 0) return;

  const examplePath = path.join(cwd, ".env.example");
  let content = "";

  // 1. Attempt to read the existing file to preserve user formatting and comments
  try {
    content = await fs.readFile(examplePath, "utf-8");
  } catch (error) {
    // File doesn't exist, we start with an empty string
  }

  // 2. Format the new variables to be appended (empty values for security)
  const linesToAppend = missingVars.map((v) => `${v}=`).join("\n");

  // 3. Ensure clean formatting by checking for trailing newlines
  let newContent = content;
  if (newContent.length > 0 && !newContent.endsWith("\n")) {
    newContent += "\n";
  }
  
  newContent += linesToAppend + "\n";

  // 4. Write the synchronized content back to disk
  await fs.writeFile(examplePath, newContent, "utf-8");
}