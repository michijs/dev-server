import fs from 'fs';
import { getPath } from './getPath';

export function copy(src, dest, fileTransformer?: (fileName: string, fileContent: string) => Buffer | string) {
  const srcDir = fs.readdirSync(src);
  srcDir.forEach(fileName => {
    const srcPath = getPath(`${src}/${fileName}`);
    const destPath = getPath(`${dest}/${fileName}`);
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath);
      copy(srcPath, destPath, fileTransformer);
    } else {
      const srcFileContent = fs.readFileSync(srcPath, { encoding: 'utf-8' });
      const srcFile = fileTransformer ? fileTransformer(fileName, srcFileContent) : srcFileContent;
      fs.writeFileSync(destPath, srcFile);
    }
  });
}
