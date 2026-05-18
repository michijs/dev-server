import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createBrowserContext, generatedPath } from "./browserContext.js";

const svgPath = resolve(
  getPath(dirname(fileURLToPath(import.meta.url))),
  "../..",
);

export async function generateFeatureImage(callback: () => void, src: string) {
  const ctx = await createBrowserContext();
  const { browser, takeScreenshots } = ctx;
  const { default: sharp } = await import("sharp");

  if (!existsSync(generatedPath)) mkdirSync(generatedPath, { recursive: true });

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
    sharp(src).resize(512, 512).png().toBuffer(),
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

  await sharp(Buffer.from(svgString))
    .resize(1024, 500)
    .png()
    .toFile(getPath(`${generatedPath}/feature-image.png`));

  callback();
  await browser.close();
  process.exit();
}
