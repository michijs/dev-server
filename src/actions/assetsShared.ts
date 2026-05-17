import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { readFileSync } from "fs";
import { Image, file as bunFile } from "bun";
import { isSvgPath, rasterizeSvg } from "../utils/imageHelpers.js";

export const generatedPath = getPath(
  `${config.public.path}/${config.public.assets.path}/generated`,
);
export const screenshotsPath = getPath(`${generatedPath}/screenshots`);

/**
 * Loads `src` (raster or SVG) into a Bun.Image. SVG inputs are first
 * rasterized to PNG via resvg since `Bun.Image` only handles raster formats.
 * Does NOT require Playwright.
 */
export async function loadImage(src: string): Promise<Image> {
  if (isSvgPath(src)) {
    const svgString = readFileSync(src, "utf-8");
    // Rasterize at a generous size so subsequent resizes stay sharp.
    const pngBuffer = await rasterizeSvg(svgString, 1080, 1080);
    return new Image(pngBuffer);
  }
  return bunFile(src).image();
}
