import { getPath } from '../utils/getPath.js';
import { config } from '../config/config.js';
import { mkdirSync, existsSync } from 'fs';

export async function generateIcons(callback: () => void, src: string) {
  const destPath = getPath(`${config.public.path}/assets/generated`);
  if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true });

  const { default: sharp } = await import('sharp');
  const { sharpsToIco } = await import('sharp-ico');
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
    sharpsToIco([image], getPath(`${config.public.path}/favicon.ico`), {
      sizes: [16],
      resizeOptions: { width: 16, height: 16 },
    }),
  ]);

  callback();
}
