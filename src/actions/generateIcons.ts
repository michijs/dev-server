import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync } from "fs";
import { pngToIco } from "../utils/pngToIco.js";
import { basename } from "path";
import { Image } from "bun";
import { assetsSizes } from "../constants.js";
import { getColor } from "colorthief";
import { flattenWithBackground } from "../utils/imageHelpers.js";
import { generatedPath, loadImage, screenshotsPath } from "./assetsShared.js";

const generateFavicon = async (src: string, dest: string) => {
  const iconSizes = [16, 24, 32, 48, 64, 128, 256];
  const resizedBuffers = await Promise.all(
    iconSizes.map(async (size) => {
      const image = await loadImage(src);
      return await image.resize(size, size).png().buffer();
    }),
  );

  writeFileSync(dest, await pngToIco(resizedBuffers, iconSizes));
};

export async function generateIcons(callback: () => void, src: string) {
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
    const image = await loadImage(src);
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
    readFileSync(tempFileName),
    color,
  );

  rmSync(tempFileName, { force: true });

  const writeVariant = async (
    sizeFn: (img: Image) => Image,
    formatFn: (img: Image) => Image,
    dest: string,
    sourceBuffer?: Buffer | Uint8Array,
  ) => {
    const image = sourceBuffer
      ? new Image(sourceBuffer)
      : await loadImage(src);
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
    generateFavicon(src, getPath(`${config.public.path}/favicon.ico`)),
  ]);

  callback();
  process.exit();
}
