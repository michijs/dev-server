import { config } from "../config/config.js";
import { exec } from "child_process";

export async function testTsc(callback: () => void) {
  exec(`tsc --noEmit --project ${config.esbuildOptions.tsconfig}`, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
    if (stdout)
      console.log(stdout);
    if (error || stderr) {
      console.error(error?.message ?? stderr)
      process.exit(1)
    }
    callback()
  });
}
