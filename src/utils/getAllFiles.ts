import fs from "fs";
import { getPath } from "./getPath.js";

export const getAllFiles = (
  dirPath: string,
  dirToShow: string = dirPath,
  arrayOfFiles: string[] = [],
) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const normalizedPath = getPath(`${dirPath}/${file}`);
    const filePath = `${dirToShow}/${file}`;
    if (fs.statSync(normalizedPath).isDirectory()) {
      arrayOfFiles = getAllFiles(normalizedPath, filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
};
