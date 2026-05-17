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

export function installPlaywright() {
  const playwrightVersion = `playwright@${packageJson.dependencies["playwright-core"]}`;
  console.log(`Installing ${playwrightVersion}...`);

  // Try, in order:
  //   1. bunx without --with-deps (Chromium binary only, any OS, no sudo)
  //   2. bunx with --with-deps (Debian/Ubuntu only, needs sudo)
  //   3. npx without --with-deps
  //   4. npx with --with-deps
  // The first one that succeeds wins. We try the dep-less variant first so the
  // common case (system libs already present) doesn't prompt for sudo or fail
  // on distros where Playwright can't drive apt-get.
  const baseCmd = `${playwrightVersion} install chromium`;
  const runners = ["bunx", "npx"];
  const commands = runners.flatMap((runner) => [
    `${runner} ${baseCmd}`,
    `${runner} ${baseCmd} --with-deps`,
  ]);

  return new Promise<void>((resolve, reject) => {
    exec(commands.join(" || "), (error, stdout) => {
      if (error) {
        console.error(`Error during Playwright installation: ${error.message}`);
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
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
