import fs from "fs";
import { getPath } from "./getPath.js";

export type Transformer = {
  fileRegex: RegExp;
  transformer: (
    fileContent: string,
    path?: string,
  ) => Promise<Buffer | string> | Buffer | string;
  pathTransformer?: (destPath: string) => string;
};

export function copyFile(
  src: string,
  fileName: string,
  dest: string,
  transformers: Transformer[],
  omit?: RegExp[],
) {
  const srcPath = getPath(`${src}/${fileName}`);
  const destPath = getPath(`${dest}/${fileName}`);

  if (fs.lstatSync(srcPath).isDirectory())
    return copy(srcPath, destPath, transformers, omit);

  if (omit?.find((x) => x.test(srcPath))) return;

  const fileTransformer = transformers?.filter((x) =>
    x.fileRegex.test(fileName),
  );

  if (fileTransformer.length === 0)
    return fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);

  fileTransformer.forEach(async (x) => {
    const srcFileContent = fs.readFileSync(srcPath, {
      encoding: "utf-8",
    });
    const finalDestPath = x.pathTransformer?.(destPath) ?? destPath;
    try {
      const transformedFile = await x.transformer(srcFileContent, srcPath);
      fs.writeFileSync(finalDestPath, transformedFile);
    } catch {}
  });
}

export function copy(
  src: string,
  dest: string,
  transformers: Transformer[],
  omit?: RegExp[],
) {
  const srcDir = fs.readdirSync(src);
  try {
    fs.mkdirSync(dest);
  } catch {}
  for (const fileName of srcDir)
    copyFile(src, fileName, dest, transformers, omit);
}
