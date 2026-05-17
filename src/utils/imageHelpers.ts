import { Image } from "bun";
import { Resvg } from "@resvg/resvg-js";

/**
 * Rasterizes an SVG (provided as a string) to a PNG buffer using resvg.
 * No browser required.
 */
export async function rasterizeSvg(
  svgString: string,
  width: number,
  height: number,
): Promise<Buffer> {
  const resvg = new Resvg(svgString, {
    fitTo: { mode: "width", value: width },
    background: "rgba(0,0,0,0)",
  });
  // Note: resvg fits by width preserving aspect ratio. For our use cases the
  // SVGs declare width/height explicitly so the output matches `width`x`height`.
  // `height` is kept in the signature for callers that previously relied on it
  // (e.g. feature-image template, which has a 1024x500 aspect ratio that
  // matches the SVG viewBox).
  void height;
  const pngData = resvg.render().asPng();
  return Buffer.from(pngData);
}

/**
 * Composites a PNG buffer onto a solid background color, returning a new PNG
 * buffer. Implemented by wrapping the PNG in an SVG with a background rect and
 * rasterizing with resvg.
 */
export async function flattenWithBackground(
  pngBuffer: Buffer | Uint8Array,
  background: { r: number; g: number; b: number } | string,
): Promise<Buffer> {
  const bg =
    typeof background === "string"
      ? background
      : `rgb(${background.r},${background.g},${background.b})`;

  const { width, height } = await new Image(pngBuffer).metadata();
  const dataUrl = `data:image/png;base64,${Buffer.from(pngBuffer).toString("base64")}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/><image href="${dataUrl}" width="${width}" height="${height}"/></svg>`;

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  });
  return Buffer.from(resvg.render().asPng());
}

/**
 * Returns true when the path looks like an SVG file.
 */
export function isSvgPath(src: string): boolean {
  return src.toLowerCase().endsWith(".svg");
}
