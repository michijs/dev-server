import type { Plugin } from "esbuild";
import coloredString from "../../utils/coloredString.js";
import { Timer } from "../../classes/Timer.js";

export const counterPlugin: Plugin = {
  name: "michijs-counter",
  setup(build) {
    const buildTimer = new Timer();
    build.onStart(() => buildTimer.startTimer());
    build.onEnd(() => {
      console.log(
        coloredString(`  Build finished in ${buildTimer.endTimer()}ms`),
      );
    });
  },
}