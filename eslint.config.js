// eslint.config.js

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Base JavaScript recommended rules
  eslint.configs.recommended,
  
  // 2. TypeScript recommended rules
  ...tseslint.configs.recommended,
  
  // 3. Global ignores (faster linting)
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "test/**"]
  },
  
  // 4. Custom Elite Overrides
  {
    rules: {
      // Enforce the "Zero 'any' Policy"
      "@typescript-eslint/no-explicit-any": "error",
      
      // Warn on unused variables instead of breaking the build immediately
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Node.js CLI allows console.log
      "no-console": "off"
    }
  }
);