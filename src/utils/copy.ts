import fs from 'fs';
import { getPath } from './getPath';
import { transformers } from './transformers';

export type Tranformer = {
  fileRegex: RegExp,
  transformer: (fileContent: string) => Buffer | string,
  pathTransformer?: (destPath: string) => string
}

export function copyFile(src: string, fileName: string, dest: string, omit?: RegExp[]) {
  if (!omit?.find(x => x.test(fileName))) {
    const srcPath = getPath(`${src}/${fileName}`);
    const destPath = getPath(`${dest}/${fileName}`);
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath);
      copy(srcPath, destPath);
    } else {
      const fileTransformer = transformers?.find(x => x.fileRegex.test(fileName));
      if (fileTransformer) {
        const srcFileContent = fs.readFileSync(srcPath, { encoding: 'utf-8' });
        const finalDestPath = fileTransformer.pathTransformer?.(destPath) ?? destPath
        const transformedFile = fileTransformer.transformer(srcFileContent);
        fs.writeFileSync(finalDestPath, transformedFile);
      } else
        fs.copyFileSync(srcPath, destPath, fs.constants.COPYFILE_FICLONE);
    }
  }
}

export function copy(src: string, dest: string, omit?: RegExp[]) {
  const srcDir = fs.readdirSync(src);
  srcDir.forEach(fileName => copyFile(src, fileName, dest, omit));
}
