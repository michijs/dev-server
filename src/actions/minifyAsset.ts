import { getPath } from "../utils/getPath.js";
import { readdirSync, rmSync, statSync } from "fs";
import { basename, dirname } from "path";

async function minifyImage(src: string) {
  if (!src.endsWith('webp')) {
    const { default: sharp } = await import("sharp");
    const image = sharp(src);
    const fileNameWithoutExtension = basename(src).split(".")[0];
    const newDirname = dirname(src);

    await image
      .webp()
      .toFile(getPath(`${newDirname}/${fileNameWithoutExtension}.webp`));

    rmSync(src);
  }
}

export async function minifyAsset(callback: () => void, src: string) {
  const stat = await statSync(src)
  if (stat.isDirectory()) {
    await Promise.all(readdirSync(src).map(async x => {
      await minifyImage(getPath(`${src}/${x}`))
    }))
  } else {
    await minifyImage(src)
  }

  callback();
}
