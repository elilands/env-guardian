// test/parser.test.ts

import { describe, it, expect } from "vitest";
import { extractVariables } from "../src/core/env-parser.js";

describe("Environment Variable Parser", () => {
  it("should extract standard dot notation variables", () => {
    const code = `const key = process.env.STRIPE_API_KEY;`;
    const result = extractVariables(code);
    expect(result.has("STRIPE_API_KEY")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("should extract bracket notation variables with single quotes", () => {
    const code = `const key = process.env['GITHUB_TOKEN'];`;
    const result = extractVariables(code);
    expect(result.has("GITHUB_TOKEN")).toBe(true);
  });

  it("should extract bracket notation variables with double quotes", () => {
    const code = `const key = process.env["AWS_SECRET"];`;
    const result = extractVariables(code);
    expect(result.has("AWS_SECRET")).toBe(true);
  });

  it("should support modern optional chaining", () => {
    const code = `
      const port = process.env?.PORT || 3000;
      const host = process.env?.['HOST_NAME'];
    `;
    const result = extractVariables(code);
    expect(result.has("PORT")).toBe(true);
    expect(result.has("HOST_NAME")).toBe(true);
    expect(result.size).toBe(2);
  });

  it("should ignore invalid structures and dynamic keys", () => {
    const code = `
      const myVar = process.env;
      const dynamic = process.env[dynamicKey];
      const method = process.env.method();
    `;
    const result = extractVariables(code);
    // Dynamic keys cannot be statically analyzed via Regex, 
    // and 'method' is valid syntax but bad practice. Our regex allows standard words.
    expect(result.has("dynamicKey")).toBe(false);
  });

  it("should deduplicate multiple occurrences of the same variable", () => {
    const code = `
      const a = process.env.API_URL;
      const b = process.env["API_URL"];
      const c = process.env?.API_URL;
    `;
    const result = extractVariables(code);
    expect(result.size).toBe(1);
    expect(result.has("API_URL")).toBe(true);
  });
});