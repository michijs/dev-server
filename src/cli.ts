import coloredString from "./utils/coloredString.js";
import yargs from "yargs";
import { Timer } from "./classes/Timer.js";
import { hideBin } from "yargs/helpers";
import { packageJson } from "./utils/packageJson.js";
import { config } from "./config/config.js";
const version = packageJson.version;

export async function cli() {
  console.log(`  ${coloredString(`Running dev server version ${version}.`)}`);
  const timer = new Timer();

  const showReadyMessage = () =>
    console.log(`
  ${coloredString(`Ready in ${timer.endTimer()}ms.`)}`);
  timer.startTimer();

  const args = await yargs(hideBin(process.argv))
    .option("start", {
      type: "boolean",
      default: false,
      description: "Allows to start a dev server as a webpage.",
    })
    .option("build", {
      type: "boolean",
      default: false,
      description: "Allows to build the src code as a webpage.",
    })
    .option("dist", {
      type: "boolean",
      default: false,
      description: "Allows to distribute the src code as a package.",
    })
    .option("test-tsc", {
      type: "boolean",
      default: false,
      description: "Allows to test typescript files without emitting files.",
    })
    .option("generate-assets", {
      type: "string",
      description:
        "Allows to generate a full set of icons and screenshots from a src icon.",
    })
    .option("minify-asset", {
      type: "string",
      description: "Allows to minify an asset.",
    })
    .option("watch", {
      type: "boolean",
      default: false,
      alias: "w",
    })
    .option("env", {
      type: "string",
    })
    .help()
    .alias("help", "h").argv;

  process.env.NODE_ENV =
    process.env.NODE_ENV ||
    args.env ||
    (args.build || args.minifyAsset
      ? "PRODUCTION"
      : args.dist || args.testTsc
        ? "DISTRIBUTION"
        : "DEVELOPMENT");

  const generateAssets =
    args.generateAssets === "" ? `${config.public.path}/assets/icon.svg` : args.generateAssets;
  if (generateAssets) {
    const action = await import("./actions/generateAssets.js");
    await action.generateAssets(showReadyMessage, generateAssets);
  } else
    console.log(coloredString(`  Running in ${process.env.NODE_ENV} mode`));

  if (args.start) {
    const action = await import("./actions/start.js");
    action.start(showReadyMessage);
  }
  if (args.build) {
    const action = await import("./actions/build.js");
    action.build(showReadyMessage);
  }
  if (args.dist) {
    const action = await import("./actions/dist.js");
    action.dist(showReadyMessage, args.watch);
  }
  if (args.testTsc) {
    const action = await import("./actions/testTsc.js");
    action.testTsc(showReadyMessage);
  }
  if (args.minifyAsset) {
    const action = await import("./actions/minifyAsset.js");
    action.minifyAsset(showReadyMessage, args.minifyAsset);
  }
}
