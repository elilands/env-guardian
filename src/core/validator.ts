// src/core/validator.ts

import { z } from "zod";

export interface ValidationReport {
  missingInEnv: string[];
  missingInExample: string[];
  orphanedInEnv: string[];
  invalidValues: string[];
}

/**
 * Cross-references scanned variables with physical .env files and validates values using Zod.
 */
export function validateEnvironments(
  scannedVars: Set<string>,
  envVars: Record<string, string>,
  exampleVars: Record<string, string>
): ValidationReport {
  const scannedArray = Array.from(scannedVars);
  const envKeys = Object.keys(envVars);
  const exampleKeys = Object.keys(exampleVars);

  // 1. Missing in .env (Required by code, but missing locally)
  const missingInEnv = scannedArray.filter((v) => !envKeys.includes(v));

  // 2. Missing in .env.example (Required by code, missing in the template)
  const missingInExample = scannedArray.filter((v) => !exampleKeys.includes(v));

  // 3. Orphaned in .env (Present in .env, but nowhere to be found in the codebase)
  const orphanedInEnv = envKeys.filter((v) => !scannedVars.has(v));

  // 4. Dynamic Zod Validation: Ensure defined variables are not empty strings
  const schemaShape: Record<string, z.ZodString> = {};
  
  scannedArray.forEach((variable) => {
    schemaShape[variable] = z.string().min(1, "Value cannot be empty");
  });

  // We use .partial() because missing keys are already handled by `missingInEnv`. 
  // Zod's job here is purely to validate the FORMAT of existing keys.
  const dynamicSchema = z.object(schemaShape).partial();
  
  const validationResult = dynamicSchema.safeParse(envVars);
  const invalidValues: string[] = [];

  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      invalidValues.push(String(issue.path[0]));
    });
  }

  return {
    missingInEnv,
    missingInExample,
    orphanedInEnv,
    invalidValues,
  };
}