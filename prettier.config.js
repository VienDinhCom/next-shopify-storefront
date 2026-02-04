// @ts-check

import { defineConfig } from "@esmate/prettier";

export default defineConfig({
  tailwind: {
    tailwindFunctions: ["cn"],
    tailwindStylesheet: "src/app/globals.css",
  },
  ignores: ["./src/lib/graphql/**/*", "next-env.d.ts"],
});
