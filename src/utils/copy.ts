import fs from 'fs';
import { getPath } from './getPath';

export function copy(src, dest) {
  const publicDir = fs.readdirSync(src);
  publicDir.forEach(fileName => {
    const srcPath = getPath(`${src}/${fileName}`);
    const destPath = getPath(`${dest}/${fileName}`);
    if (fs.lstatSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath);
      copy(srcPath, destPath);
    } else {
      fs.writeFileSync(destPath, fs.readFileSync(srcPath));
    }
  });
}
