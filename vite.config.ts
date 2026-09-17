import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import lovableMcpTanStack from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  plugins: [lovableMcpTanStack()],
});
