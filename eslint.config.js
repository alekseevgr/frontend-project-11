import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended, prettierConfig],
    plugins: { prettier },
    languageOptions: { globals: globals.browser },
    rules: {
      "prettier/prettier": "error",
    },
  },
]);
