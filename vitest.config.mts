import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` -> `./src/*` alias in tsconfig.json.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Node by default: the schema, catalog and vocabulary tests are pure and
    // have no business paying for a DOM. The two store test files opt into
    // jsdom with a `@vitest-environment` comment, because a real localStorage
    // is what makes the "refresh and lose nothing" criterion testable rather
    // than assumed, and creating a jsdom environment is the expensive part.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
