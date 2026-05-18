import { getPath } from "../utils/getPath.js";
import { config } from "../config/config.js";
import { mkdirSync, existsSync, writeFileSync, rmSync } from "fs";
import { pngToIco } from "../utils/pngToIco.js";
import { basename } from "path";
import { assetsSizes } from "../constants.js";
import { getColor } from "colorthief";
import { generatedPath, screenshotsPath } from "./browserContext.js";

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

export async function generateIcons(callback: () => void, src: string) {
  const { default: sharp } = await import("sharp");
  rmSync(generatedPath, { recursive: true, force: true });
  if (!existsSync(generatedPath))
    mkdirSync(screenshotsPath, { recursive: true });
  const image = sharp(src);
  const fileNameWithoutExtension = basename(src).split(".")[0];
  const tempFileName = getPath(
    `${generatedPath}/${fileNameWithoutExtension}-temp.png`,
  );
  await image.png().toFile(tempFileName);
  const dominantColor = await getColor(tempFileName);

  rmSync(tempFileName, { force: true });
  const color = dominantColor?.rgb();
  const flattenImage = image.clone().flatten({ background: color });

  await Promise.all([
    ...assetsSizes.webp.flatMap((x) =>
      [image, flattenImage].map((y) =>
        y
          .resize(x, x)
          .webp()
          .toFile(
            getPath(
              `${generatedPath}/${fileNameWithoutExtension}-${x}${y === flattenImage ? "-maskable" : ""}.webp`,
            ),
          ),
      ),
    ),
    ...assetsSizes.png.flatMap((x) =>
      [image, flattenImage].map((y) =>
        y
          .resize(x, x)
          .png()
          .toFile(
            getPath(
              `${generatedPath}/${fileNameWithoutExtension}-${x}${y === flattenImage ? "-maskable" : ""}.png`,
            ),
          ),
      ),
    ),
    generateFavicon(src, getPath(`${config.public.path}/favicon.ico`)),
  ]);

  callback();
  process.exit();
}
