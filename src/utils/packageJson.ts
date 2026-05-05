import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Intentionally not using import because typescript generates a src folder inside bin
export const packageJson = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../..", "package.json"),
    { encoding: "utf-8" },
  ),
);
