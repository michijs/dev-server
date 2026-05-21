import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { getLocalURL } from "../utils/getLocalURL.js";
import {
  chromium,
  type Browser,
  type PageScreenshotOptions,
} from "playwright-core";
import type { PageCallback, Viewport } from "../types.js";
import { exec } from "child_process";
import { packageJson } from "../utils/packageJson.js";

export const generatedPath = getPath(
  `${config.public.path}/${config.public.assets.path}/generated`,
);
export const screenshotsPath = getPath(`${generatedPath}/screenshots`);

export function installPlaywright() {
  const playwrightVersion = `playwright@${packageJson.dependencies["playwright-core"]}`;
  console.log(`Installing ${playwrightVersion}...`);

  return new Promise<void>((resolve, reject) => {
    const runners = ["bunx", "npx"];
    exec(
      runners
        .map((x) => `${x} ${playwrightVersion} install chromium --with-deps`)
        .join(" || "),
      (error, stdout) => {
        if (error) {
          console.error(
            `Error during Playwright installation: ${error.message}`,
          );
          return reject(error);
        }
        console.log(stdout);
        resolve();
      },
    );
  });
}

export interface TakeScreenshotsParams {
  path: string;
  viewports: Viewport[];
  options?(
    viewport: Viewport,
    pagePrefix?: string | void,
  ): PageScreenshotOptions;
  pageCallback?: PageCallback;
}

/**
 * Bootstraps Playwright + the dev server and returns a context with a launched
 * browser and a ready-to-use `takeScreenshots` helper. Callers are responsible
 * for closing the browser via `ctx.browser.close()` and exiting the process.
 */
export async function createBrowserContext() {
  await installPlaywright();
  const browser: Browser = await chromium.launch({ headless: true });

  config.watch = false;
  config.openBrowser = false;
  const { start } = await import("./start.js");
  const port = await new Promise<number>((resolve) => {
    start((port) => resolve(port));
  });

  async function takeScreenshots({
    viewports,
    options,
    pageCallback,
    path,
  }: TakeScreenshotsParams) {
    return await Promise.all(
      viewports.map(async (viewport) => {
        const page = await browser.newPage({
          reducedMotion: "reduce",
          colorScheme: "dark",
          viewport,
        });
        const suffix = await pageCallback?.(page);
        const optionsResult =
          options?.(viewport, suffix ? `/${suffix}` : suffix) ?? {};
        await page.goto(`${getLocalURL(port)}${path}`, {
          waitUntil: "load",
        });
        await page.waitForTimeout(3000);
        const screenshot = await page.screenshot({
          fullPage: true,
          ...optionsResult,
        });
        await page.close();
        return screenshot;
      }),
    );
  }

  return { browser, port, takeScreenshots };
}

export type BrowserContext = Awaited<ReturnType<typeof createBrowserContext>>;
