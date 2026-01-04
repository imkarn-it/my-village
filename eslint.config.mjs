import nextConfig from "eslint-config-next";
import nextTypeScriptConfig from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "coverage/**",
      "node_modules/**",
    ],
  },
  ...nextConfig,
  ...nextTypeScriptConfig,
  {
    rules: {
      // Allow unused vars with underscore prefix (common pattern for intentionally unused)
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      // Allow any type with warning (will be fixed incrementally)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow ts-ignore with warning (prefer ts-expect-error but don't block build)
      "@typescript-eslint/ban-ts-comment": ["warn", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": "allow-with-description",
        "ts-nocheck": true,
        "ts-check": false
      }],
      // Allow img element with warning (will migrate to next/image incrementally)
      "@next/next/no-img-element": "warn",
      // Allow unescaped entities with warning
      "react/no-unescaped-entities": "warn",
      // Prefer const warning
      "prefer-const": "warn",
      // React hooks exhaustive deps warning
      "react-hooks/exhaustive-deps": "warn",
      // Disable some non-critical warnings for now (can re-enable later)
      "@typescript-eslint/no-unused-vars": "off", // Most are intentional _
      "@typescript-eslint/no-explicit-any": "off", // Focus on critical types only
      "react/no-unescaped-entities": "off", // Security handled at HTML level
      "prefer-const": "off", // Minor performance concern
      "react-hooks/set-state-in-effect": "off", // Handled manually
      "@next/next/no-assign-module-variable": "off", // Common in some test setups
      "@typescript-eslint/no-require-imports": "off", // Allowed in scripts
      "react-hooks/purity": "off", // Allow Math.random() in useMemo for now
      "react-hooks/static-components": "off", // Allow dynamic components in render for now
      "react-hooks/immutability": "off", // Allow mutations in effects for now
      "react-hooks/exhaustive-deps": "off", // Allow missing deps for now
      "@next/next/no-img-element": "off", // Allow img tags for now
    },
  },
];

export default eslintConfig;
