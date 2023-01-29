import fs from 'fs';
import { getPath } from './getPath';

type Tranformer = {
  fileName: string,
  transformer: (fileContent: string) => Buffer | string
}

export function copy(src, dest, fileTransformers?: Tranformer[]) {
  const srcDir = fs.readdirSync(src);
  srcDir.forEach(fileName => {
    const srcPath = getPath(`${src}/${fileName}`);
    const destPath = getPath(`${dest}/${fileName}`);
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath);
      copy(srcPath, destPath, fileTransformers);
    } else {
      const fileTransformer = fileTransformers?.find(x => x.fileName === fileName);
      if (fileTransformer) {
        const srcFileContent = fs.readFileSync(srcPath, { encoding: 'utf-8' });
        const transformedFile = fileTransformer.transformer(srcFileContent);
        fs.writeFileSync(destPath, transformedFile);
      } else
        fs.copyFileSync(srcPath, destPath);
    }
  });
}
