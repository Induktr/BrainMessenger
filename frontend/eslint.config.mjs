import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  ignorePatterns: ["node_modules", ".next", "build"],
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Temporarily disable
      "@typescript-eslint/no-unused-vars": "off", // Temporarily disable
      "prefer-const": "off", // Temporarily disable
      "@next/next/no-img-element": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-assignment": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-call": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-member-access": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-return": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-argument": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-optional-chaining": "off", // Temporarily disable
      "@typescript-eslint/no-unsafe-enum": "off", // Temporarily disable
    },
  },
];

export default eslintConfig;
