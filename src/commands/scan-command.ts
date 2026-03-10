// src/commands/scan-command.ts

import picocolors from "picocolors";
import { scanProject } from "../core/file-scanner.js";

export interface ScanCommandOptions {
  ignore?: string[];
}

export async function executeScan(options: ScanCommandOptions): Promise<void> {
  console.log(picocolors.cyan("🚀 Initializing env-guardian scan..."));
  const startTime = performance.now();

  try {
    const currentDir = process.cwd();
    const variables = await scanProject({ 
      cwd: currentDir,
      ignorePatterns: options.ignore 
    });
    
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(picocolors.green(`✔ Scan completed in ${duration}ms.`));
    console.log(picocolors.bold(`📦 Found ${variables.size} unique environment variables:`));

    if (variables.size === 0) {
      console.log(picocolors.yellow("   No process.env variables detected."));
    } else {
      Array.from(variables).sort().forEach((v) => {
        console.log(picocolors.dim("   - ") + picocolors.white(v));
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(picocolors.red(`❌ Scan failed: ${error.message}`));
    }
    process.exit(1);
  }
}