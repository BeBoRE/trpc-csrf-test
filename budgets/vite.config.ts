import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const path = dirname(fileURLToPath(import.meta.url));
const root = resolve(path, "client");

export default defineConfig({
  root,
});
