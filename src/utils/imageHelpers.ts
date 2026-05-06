import type { Browser } from "playwright-core";
import { Image } from "bun";

/**
 * Rasterizes an SVG (provided as a string) to a PNG buffer using a Playwright
 * browser instance. Used as a replacement for `sharp(Buffer.from(svgString))`.
 */
export async function rasterizeSvg(
  browser: Browser,
  svgString: string,
  width: number,
  height: number,
): Promise<Buffer> {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const html = `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:${width}px;height:${height}px}</style></head><body>${svgString}</body></html>`;
  await page.goto(
    `data:text/html;base64,${Buffer.from(html).toString("base64")}`,
    {
      waitUntil: "load",
    },
  );
  const screenshot = await page.screenshot({
    type: "png",
    omitBackground: true,
    fullPage: false,
    clip: { x: 0, y: 0, width, height },
  });
  await page.close();
  return Buffer.from(screenshot);
}

/**
 * Composites a PNG buffer onto a solid background color, returning a new PNG
 * buffer. Used as a replacement for `sharp().flatten({ background })`.
 */
export async function flattenWithBackground(
  browser: Browser,
  pngBuffer: Buffer | Uint8Array,
  background: { r: number; g: number; b: number } | string,
): Promise<Buffer> {
  const bg =
    typeof background === "string"
      ? background
      : `rgb(${background.r},${background.g},${background.b})`;

  // We need to know the source dimensions; decode via Bun.Image metadata.
  const { width, height } = await new Image(pngBuffer).metadata();
  const dataUrl = `data:image/png;base64,${Buffer.from(pngBuffer).toString("base64")}`;

  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const html = `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:${bg}}img{display:block;width:${width}px;height:${height}px}</style></head><body><img src="${dataUrl}"/></body></html>`;
  await page.goto(
    `data:text/html;base64,${Buffer.from(html).toString("base64")}`,
    {
      waitUntil: "load",
    },
  );
  const screenshot = await page.screenshot({
    type: "png",
    omitBackground: false,
    fullPage: false,
    clip: { x: 0, y: 0, width, height },
  });
  await page.close();
  return Buffer.from(screenshot);
}

/**
 * Returns true when the path looks like an SVG file.
 */
export function isSvgPath(src: string): boolean {
  return src.toLowerCase().endsWith(".svg");
}
