import { getPath } from '../utils/getPath.js';
import { config } from '../config/config.js';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import { pngToIco } from '../utils/pngToIco.js';

const generateFavicon = async (src: string, dest: string) => {
  const { default: sharp } = await import('sharp');
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
  const destPath = getPath(`${config.public.path}/assets/generated`);
  if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true });

  const { default: sharp } = await import('sharp');
  const sizes = [24, 48, 72, 96, 128, 256, 512];
  const image = sharp(src);

  await Promise.all([
    ...sizes.map((x) => {
      return image
        .resize(x, x)
        .webp()
        .toFile(
          getPath(
            `${destPath}/${src.split('/').at(-1)?.split('.')[0]}-${x}.webp`,
          ),
        );
    }),
    image
      .resize(512, 512)
      .png()
      .toFile(
        getPath(`${destPath}/${src.split('/').at(-1)?.split('.')[0]}-512.png`),
      ),
    generateFavicon(src, getPath(`${config.public.path}/favicon.ico`)),
  ]);

  callback();
}
