import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync } from "fs";
import { pngToIco } from "../utils/pngToIco.js";
import type { PageScreenshotOptions } from "playwright";
import { fileURLToPath } from "url";
import { basename, dirname, resolve } from "path";
import { getLocalURL } from "../utils/getLocalURL.js";
import { assetsSizes } from "../constants.js";
import { chromium } from "playwright";
import type { PageCallback, Viewport } from "../types.js";

const generatedPath = getPath(
  `${config.public.path}/${config.public.assets.path}/generated`,
);
const screenshotsPath = getPath(`${generatedPath}/screenshots`);
const svgPath = resolve(
  getPath(dirname(fileURLToPath(import.meta.url))),
  "../..",
);

const generateFavicon = async (src: string, dest: string) => {
  const { default: sharp } = await import("sharp");
  const image = await sharp(src);

  const iconSizes = [16, 24, 32, 48, 64, 128, 256];
  const resizedBuffers = await Promise.all(
    iconSizes.map((size) => {
      return image.resize(size, size).png().toBuffer();
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
const browser = await chromium.launch({
  headless: true,
});

const port = await new Promise<number>(async (resolve) => {
  const { start } = await import("./start.js");
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
  const { default: sharp } = await import("sharp");
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
    sharp(src).resize(512, 512).png().toBuffer(),
  ]);

  const svg = readFileSync(svgFilePath);

  const svgString = svg
    .toString()
    .replace(
      "{{phone-href}}",
      `data:image/png;base64,${screenshots[0].toString("base64")}`,
    )
    .replace(
      "{{tablet-href}}",
      `data:image/png;base64,${screenshots[1].toString("base64")}`,
    )
    .replace(
      "{{pc-href}}",
      `data:image/png;base64,${screenshots[2].toString("base64")}`,
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

  await sharp(Buffer.from(svgString))
    .resize(1024, 500)
    .png()
    .toFile(getPath(`${generatedPath}/feature-image.png`));
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
  const { default: sharp } = await import("sharp");
  rmSync(generatedPath, { recursive: true, force: true });
  if (!existsSync(generatedPath))
    mkdirSync(screenshotsPath, { recursive: true });
  const image = sharp(src);
  const fileNameWithoutExtension = basename(src).split(".")[0];

  await Promise.all([
    ...assetsSizes.webp.map((x) => {
      return image
        .resize(x, x)
        .webp()
        .toFile(
          getPath(`${generatedPath}/${fileNameWithoutExtension}-${x}.webp`),
        );
    }),
    ...assetsSizes.png.map((x) => {
      return image
        .resize(x, x)
        .png()
        .toFile(
          getPath(`${generatedPath}/${fileNameWithoutExtension}-${x}.png`),
        );
    }),
    generateFavicon(src, getPath(`${config.public.path}/favicon.ico`)),
    generateFeatureImage(src),
    generateScreenshots(),
  ]);

  callback();
  await browser.close();
  process.exit();
}
