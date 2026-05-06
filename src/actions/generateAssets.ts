import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync } from "fs";
import { pngToIco } from "../utils/pngToIco.js";
import { fileURLToPath } from "url";
import { basename, dirname, resolve } from "path";
import { getLocalURL } from "../utils/getLocalURL.js";
import { assetsSizes } from "../constants.js";
import {
  chromium,
  type Browser,
  type PageScreenshotOptions,
} from "playwright-core";
import type { PageCallback, Viewport } from "../types.js";
import { exec } from "child_process";
import { getColor } from "colorthief";
import { packageJson } from "../utils/packageJson.js";
import {
  flattenWithBackground,
  isSvgPath,
  rasterizeSvg,
} from "../utils/imageHelpers.js";

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
        console.error(
          `Error during Playwright installation: ${error.message}`,
        );
        return reject(error);
      }
      console.log(stdout);
      resolve();
    });
  });
}

const generatedPath = getPath(
  `${config.public.path}/${config.public.assets.path}/generated`,
);
const screenshotsPath = getPath(`${generatedPath}/screenshots`);
const svgPath = resolve(
  getPath(dirname(fileURLToPath(import.meta.url))),
  "../..",
);

/**
 * Loads `src` (raster or SVG) into a Bun.Image. SVG inputs are first
 * rasterized to PNG via Playwright since `Bun.Image` only handles raster
 * formats.
 */
async function loadImage(src: string, browser: Browser): Promise<Bun.Image> {
  if (isSvgPath(src)) {
    const svgString = readFileSync(src, "utf-8");
    // Rasterize at a generous size so subsequent resizes stay sharp.
    const pngBuffer = await rasterizeSvg(browser, svgString, 1080, 1080);
    return new Bun.Image(pngBuffer);
  }
  return Bun.file(src).image();
}

const generateFavicon = async (src: string, dest: string, browser: Browser) => {
  const iconSizes = [16, 24, 32, 48, 64, 128, 256];
  const resizedBuffers = await Promise.all(
    iconSizes.map(async (size) => {
      const image = await loadImage(src, browser);
      return await image.resize(size, size).png().buffer();
    }),
  );

  writeFileSync(dest, await pngToIco(resizedBuffers, iconSizes));
};

interface TakeScreenshotsParams {
  path: string;
  viewports: Viewport[];
  options?(
    viewport: Viewport,
    pagePrefix?: string | void,
  ): PageScreenshotOptions;
  pageCallback?: PageCallback;
}

config.watch = false;
config.openBrowser = false;
let browser: Browser;

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
      // Create a new page
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

export async function generateFeatureImage(src: string) {
  const svgFilePath = getPath(`${svgPath}/feature-image-template.svg`);
  const [screenshots, icon] = await Promise.all([
    takeScreenshots({
      viewports: [
        // Phone
        { width: 288, height: 387 },
        // Tablet
        { width: 390, height: 280 },
        // Desktop
        { width: 900, height: 550 },
      ],
      path: config.public.assets.featureImage.path,
      pageCallback: config.public.assets.featureImage.pageCallback,
    }),
    (async () => {
      const image = await loadImage(src, browser);
      return await image.resize(512, 512).png().buffer();
    })(),
  ]);

  const svg = readFileSync(svgFilePath);

  const svgString = svg
    .toString()
    .replace(
      "{{phone-href}}",
      `data:image/png;base64,${screenshots[0]!.toString("base64")}`,
    )
    .replace(
      "{{tablet-href}}",
      `data:image/png;base64,${screenshots[1]!.toString("base64")}`,
    )
    .replace(
      "{{pc-href}}",
      `data:image/png;base64,${screenshots[2]!.toString("base64")}`,
    )
    .replace(
      "{{icon-href}}",
      `data:image/png;base64,${icon.toString("base64")}`,
    )
    .replace(
      "{{background}}",
      config.public.manifest?.options?.background_color ?? "transparent",
    )
    .replace("{{app-title}}", config.public.manifest?.options?.name ?? "");

  writeFileSync(getPath(`${generatedPath}/feature-image.svg`), svgString);

  // Rasterize the assembled SVG at the requested size and write the PNG.
  const featurePng = await rasterizeSvg(browser, svgString, 1024, 500);
  writeFileSync(getPath(`${generatedPath}/feature-image.png`), featurePng);
}

export async function generateScreenshots() {
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

export async function generateAssets(callback: () => void, src: string) {
  await installPlaywright();
  browser = await chromium.launch({
    headless: true,
  });

  rmSync(generatedPath, { recursive: true, force: true });
  if (!existsSync(generatedPath))
    mkdirSync(screenshotsPath, { recursive: true });

  const fileNameWithoutExtension = basename(src).split(".")[0];
  const tempFileName = getPath(
    `${generatedPath}/${fileNameWithoutExtension}-temp.png`,
  );

  // Materialize a normalized PNG of the source so colorthief (which expects a
  // file path) and the maskable variants can both read from it.
  {
    const image = await loadImage(src, browser);
    await image.png().write(tempFileName);
  }
  const dominantColor = (await getColor(tempFileName)) as unknown as
    | [number, number, number]
    | null;
  const [r, g, b] = dominantColor ?? [0, 0, 0];
  const color = { r, g, b };

  // Pre-flatten the source against the dominant color once. The result is the
  // base for every "-maskable" variant (just resized below).
  const baseFlattenedPng = await flattenWithBackground(
    browser,
    readFileSync(tempFileName),
    color,
  );

  rmSync(tempFileName, { force: true });

  const writeVariant = async (
    sizeFn: (img: Bun.Image) => Bun.Image,
    formatFn: (img: Bun.Image) => Bun.Image,
    dest: string,
    sourceBuffer?: Buffer | Uint8Array,
  ) => {
    const image = sourceBuffer
      ? new Bun.Image(sourceBuffer)
      : await loadImage(src, browser);
    await formatFn(sizeFn(image)).write(dest);
  };

  await Promise.all([
    ...assetsSizes.webp.flatMap((x) => [
      writeVariant(
        (img) => img.resize(x, x),
        (img) => img.webp(),
        getPath(`${generatedPath}/${fileNameWithoutExtension}-${x}.webp`),
      ),
      writeVariant(
        (img) => img.resize(x, x),
        (img) => img.webp(),
        getPath(
          `${generatedPath}/${fileNameWithoutExtension}-${x}-maskable.webp`,
        ),
        baseFlattenedPng,
      ),
    ]),
    ...assetsSizes.png.flatMap((x) => [
      writeVariant(
        (img) => img.resize(x, x),
        (img) => img.png(),
        getPath(`${generatedPath}/${fileNameWithoutExtension}-${x}.png`),
      ),
      writeVariant(
        (img) => img.resize(x, x),
        (img) => img.png(),
        getPath(
          `${generatedPath}/${fileNameWithoutExtension}-${x}-maskable.png`,
        ),
        baseFlattenedPng,
      ),
    ]),
    generateFavicon(src, getPath(`${config.public.path}/favicon.ico`), browser),
    generateFeatureImage(src),
    generateScreenshots(),
  ]);

  callback();
  await browser.close();
  process.exit();
}
