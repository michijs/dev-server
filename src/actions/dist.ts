import { tsconfig } from "../config/tsconfig.js";
import fs from "fs";
import { Timer } from "../classes/Timer.js";
import coloredString from "../utils/coloredString.js";
import { config } from "../config/config.js";
import { exec } from "child_process";
import path from "path";

export function dist(callback: () => void, watchOption = false) {
  const { outDir } = tsconfig.compilerOptions;
  if (outDir) {
    const timer = new Timer();
    timer.startTimer();
    if (fs.existsSync(outDir))
      fs.rmSync(path.resolve(outDir), { recursive: true });

    exec(
      // outDir takes the dir from the extended tsconfig...
      `tsc ${watchOption ? "-w --incremental" : ""} --project ${config.esbuildOptions.tsconfig} --outDir ${outDir}`,
      { maxBuffer: 1024 * 500 },
      (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (error || stderr) {
          console.error(error?.message ?? stderr);
          process.exit(1);
        }
        callback();
      },
    );
    coloredString(`  Dist finished in ${timer.endTimer()}ms`);
  } else {
    throw new Error("Your tsconfig needs an outdir");
  }
}
