// src/commands/validate-command.ts

import picocolors from "picocolors";
import { scanProject } from "../core/file-scanner.js";
import { readEnvFiles } from "../core/env-reader.js";
import { validateEnvironments } from "../core/validator.js";
import { syncEnvExample } from "../core/env-writer.js";

export interface ValidateCommandOptions {
  fix?: boolean;
  ignore?: string[];
}

export async function executeValidate(options: ValidateCommandOptions): Promise<void> {
  console.log(picocolors.cyan("🔍 Validating environment integrity..."));
  const startTime = performance.now();

  try {
    const currentDir = process.cwd();
    
    const [variables, envFiles] = await Promise.all([
      scanProject({ 
        cwd: currentDir,
        ignorePatterns: options.ignore
      }),
      readEnvFiles(currentDir)
    ]);

    const report = validateEnvironments(variables, envFiles.env, envFiles.example);
    
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(picocolors.green(`✔ Validation completed in ${duration}ms.\n`));

    let hasCriticalErrors = false;

    if (report.missingInEnv.length > 0) {
      console.log(picocolors.red("❌ Missing in locally active .env (Required by code):"));
      report.missingInEnv.forEach(v => console.log(picocolors.dim("   - ") + picocolors.red(v)));
      hasCriticalErrors = true;
    }

    if (report.invalidValues.length > 0) {
      console.log(picocolors.red("\n❌ Empty or invalid values detected in .env:"));
      report.invalidValues.forEach(v => console.log(picocolors.dim("   - ") + picocolors.red(v)));
      hasCriticalErrors = true;
    }

    if (report.missingInExample.length > 0) {
      if (options.fix) {
        console.log(picocolors.blue("\n🔧 Auto-Fix engaged: Synchronizing .env.example..."));
        await syncEnvExample(currentDir, report.missingInExample);
        report.missingInExample.forEach(v => console.log(picocolors.dim("   + ") + picocolors.green(`${v}=`)));
        console.log(picocolors.green("✔ Template successfully updated."));
      } else {
        console.log(picocolors.yellow("\n⚠️  Missing in .env.example (Template is outdated):"));
        report.missingInExample.forEach(v => console.log(picocolors.dim("   - ") + picocolors.yellow(v)));
        console.log(picocolors.dim("   💡 Tip: Run with --fix to automatically append these variables."));
      }
    }

    if (report.orphanedInEnv.length > 0) {
      console.log(picocolors.magenta("\n👻 Orphaned in .env (Present in file, but not used in code):"));
      report.orphanedInEnv.forEach(v => console.log(picocolors.dim("   - ") + picocolors.magenta(v)));
    }

    if (!hasCriticalErrors && report.missingInExample.length === 0 && report.orphanedInEnv.length === 0) {
      console.log(picocolors.green("✨ Flawless victory! Your environment is perfectly synced."));
    }

    if (hasCriticalErrors) {
      console.log(picocolors.red("\n🔥 Critical errors found. Breaking the build."));
      process.exit(1);
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error(picocolors.red(`❌ Validation failed: ${error.message}`));
    }
    process.exit(1);
  }
}