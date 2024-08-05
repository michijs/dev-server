import { config } from "../config/config.js";
import { exec } from "child_process";

export async function testTsc(
  callback: () => void,
) {
  exec(
    `tsc --noEmit --project ${config.esbuildOptions.tsconfig}`,
    callback,
  );
}
