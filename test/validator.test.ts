// test/validator.test.ts

import { describe, it, expect } from "vitest";
import { validateEnvironments } from "../src/core/validator.js";

describe("Environment Diffing Validator", () => {
  it("should detect variables missing in .env and .env.example", () => {
    const scannedVars = new Set(["API_KEY", "DB_URL"]);
    const envVars = { API_KEY: "12345" }; // Missing DB_URL
    const exampleVars = {}; // Missing both

    const report = validateEnvironments(scannedVars, envVars, exampleVars);

    expect(report.missingInEnv).toContain("DB_URL");
    expect(report.missingInEnv).not.toContain("API_KEY");

    expect(report.missingInExample).toContain("API_KEY");
    expect(report.missingInExample).toContain("DB_URL");
  });

  it("should detect orphaned variables in .env", () => {
    const scannedVars = new Set(["API_KEY"]);
    const envVars = { 
      API_KEY: "12345",
      OLD_UNUSED_KEY: "999" // Orphaned
    };
    const exampleVars = { API_KEY: "" };

    const report = validateEnvironments(scannedVars, envVars, exampleVars);

    expect(report.orphanedInEnv).toContain("OLD_UNUSED_KEY");
    expect(report.orphanedInEnv.length).toBe(1);
  });

  it("should detect empty string values in .env using Zod dynamic schemas", () => {
    const scannedVars = new Set(["API_KEY", "SECRET"]);
    const envVars = { 
      API_KEY: "", // Invalid (empty)
      SECRET: "super-secret" // Valid
    };
    const exampleVars = { API_KEY: "", SECRET: "" };

    const report = validateEnvironments(scannedVars, envVars, exampleVars);

    expect(report.invalidValues).toContain("API_KEY");
    expect(report.invalidValues).not.toContain("SECRET");
  });

  it("should return a clean report when everything is perfectly synced", () => {
    const scannedVars = new Set(["PORT"]);
    const envVars = { PORT: "8080" };
    const exampleVars = { PORT: "3000" };

    const report = validateEnvironments(scannedVars, envVars, exampleVars);

    expect(report.missingInEnv.length).toBe(0);
    expect(report.missingInExample.length).toBe(0);
    expect(report.orphanedInEnv.length).toBe(0);
    expect(report.invalidValues.length).toBe(0);
  });
});