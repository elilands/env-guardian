#!/usr/bin/env node
// src/index.ts

import cac from "cac";
import picocolors from "picocolors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import decoupled command controllers
import { executeScan } from "./commands/scan-command.js";
import { executeValidate } from "./commands/validate-command.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = path.resolve(__dirname, "../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

const cli = cac("env-guardian");

// --- Command: SCAN ---
cli
  .command("scan", "Scan the current directory for environment variables")
  .option("--ignore <pattern>", "Ignore specific directories or files (can be used multiple times)")
  .action(async (options) => {
    const ignorePatterns = options.ignore 
      ? (Array.isArray(options.ignore) ? options.ignore : [options.ignore]) 
      : [];
    
    await executeScan({ ignore: ignorePatterns });
  });

// --- Command: VALIDATE ---
cli
  .command("validate", "Cross-reference codebase variables with .env and .env.example")
  .option("--fix", "Automatically append missing variables to .env.example")
  .option("--ignore <pattern>", "Ignore specific directories or files (can be used multiple times)")
  .action(async (options) => {
    const ignorePatterns = options.ignore 
      ? (Array.isArray(options.ignore) ? options.ignore : [options.ignore]) 
      : [];

    await executeValidate({ 
      fix: options.fix,
      ignore: ignorePatterns
    });
  });

// --- CLI Initialization & Global Options ---
cli.help();
cli.version(pkg.version);

// --- Zero-State Interceptor & Execution ---
try {
  // We parse the arguments passed by the user
  const parsed = cli.parse();

  // If no command was matched, and the user didn't explicitly ask for help (-h) or version (-v)
  if (!cli.matchedCommand && !parsed.options.help && !parsed.options.version) {
    console.log(picocolors.bold(picocolors.cyan("\n🛡️  ENV-GUARDIAN")));
    console.log(picocolors.dim("The elite environment variable manager. Sync your codebase safely.\n"));
    
    // Programmatically trigger the help menu to guide the user
    cli.outputHelp();
  }
} catch (error) {
  if (error instanceof Error) {
    // Catching cac's internal routing errors (e.g., typing 'env-guardian unknown-command')
    console.error(picocolors.red(`❌ CLI Error: ${error.message}`));
    console.log(picocolors.dim("Type 'env-guardian --help' to see available commands."));
  }
  process.exit(1);
}