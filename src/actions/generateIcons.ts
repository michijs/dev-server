import sharp from 'sharp';
import { getPath } from '../utils/getPath.js';
import { config } from '../config/config.js';
import { mkdirSync, existsSync } from 'fs';
import ico from 'sharp-ico';

export async function generateIcons(callback: () => void, src: string) {
  const sizes = [24, 48, 72, 96, 128, 256, 512];
  const image = sharp(src);
  const destPath = getPath(`${config.public.path}/assets/generated`);
  if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true });

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
    ico.sharpsToIco([image], getPath(`${config.public.path}/favicon.ico`), {
      sizes: [16],
      resizeOptions: { width: 16, height: 16 },
    }),
  ]);

  callback();
}
