import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync } from "fs";
import { assetsSizes } from "../constants.js";
import {
  createBrowserContext,
  screenshotsPath,
  type BrowserContext,
} from "./browserContext.js";

async function runScreenshots(ctx: BrowserContext) {
  const { takeScreenshots } = ctx;
  return await Promise.all(
    config.public.assets.screenshots.paths.flatMap((path) =>
      config.public.assets.screenshots.pageCallbacks.map(
        async (pageCallback, index) =>
          await takeScreenshots({
            viewports: assetsSizes.screenshots,
            path,
            pageCallback,
            options(
              viewport,
              pageSuffix = config.public.assets.screenshots.pageCallbacks
                .length > 1
                ? `_${index}`
                : "",
            ) {
              const screenshotPath = getPath(
                `${screenshotsPath}${pageSuffix}${path.replaceAll(
                  /[?#]/g,
                  "_",
                )}`,
              );
              if (!existsSync(screenshotPath))
                mkdirSync(screenshotPath, { recursive: true });
              return {
                path: getPath(
                  `${screenshotPath}/screenshot-${viewport.width}x${viewport.height}.png`,
                ),
              };
            },
          }),
      ),
    ),
  );
}

export async function generateScreenshots(callback: () => void) {
  const ctx = await createBrowserContext();

  if (!existsSync(screenshotsPath))
    mkdirSync(screenshotsPath, { recursive: true });

  await runScreenshots(ctx);

  callback();
  await ctx.browser.close();
  process.exit();
}
