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
    // have no business paying for a DOM. The store tests opt into jsdom with a
    // `@vitest-environment` comment, because a real localStorage is what makes
    // the "refresh and lose nothing" criterion testable rather than assumed;
    // the export and view tests opt in because a Word file and a mounted React
    // view both need one. Creating a jsdom environment is the expensive part,
    // which is what keeps this opt-in per file rather than a default.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
