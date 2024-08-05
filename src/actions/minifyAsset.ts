import { getPath } from "../utils/getPath.js";
import fs from "fs";
import { basename, dirname } from "path";

export async function minifyAsset(callback: () => void, src: string) {
  const { default: sharp } = await import("sharp");
  const image = sharp(src);

  const fileNameWithoutExtension = basename(src).split(".")[0];
  const newDirname = dirname(src);

  await image
    .webp()
    .toFile(getPath(`${newDirname}${fileNameWithoutExtension}.webp`));

  fs.rmdirSync(src);

  callback();
}
