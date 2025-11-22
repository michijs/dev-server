import fs from "fs";
import { getPath } from "./getPath.js";

export const getAllFiles = (dirPath: string, dirToShow: string = dirPath) => {
  const files = fs.readdirSync(dirPath);
  const arrayOfFiles: string[] = [];

  files.forEach((file) => {
    const normalizedPath = getPath(`${dirPath}/${file}`);
    const filePath = `${dirToShow}/${file}`;
    arrayOfFiles.push(
      ...(fs.statSync(normalizedPath).isDirectory()
        ? getAllFiles(normalizedPath, filePath)
        : [filePath]),
    );
  });

  return arrayOfFiles;
};
