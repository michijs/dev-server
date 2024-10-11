import fs from "fs";
import path from "path";
import { type Transformer, copyFile } from "../utils/copy.js";
import watch from "node-watch";
import { getPath } from "../utils/getPath.js";
import coloredString from "./coloredString.js";

export const syncDirs = (
  srcDir: string,
  outDir: string,
  transformers: Transformer[],
  omit?: RegExp[],
  onStartSync?: () => void,
  onEndSync?: Parameters<typeof watch.default>[2],
) => {
  watch.default(
    srcDir,
    {
      encoding: "utf-8",
      persistent: true,
      recursive: true,
    },
    (event, fileChangedPath) => {
      onStartSync?.();
      const fileSrcDir = path.dirname(fileChangedPath);
      const fileName = path.basename(fileChangedPath);
      const fileOutDir = fileSrcDir.replace(path.normalize(srcDir), outDir);
      console.log(`  ${coloredString(`File ${fileChangedPath} ${event}.`)}`);
      if (event === "remove") {
        const pathToRemove = getPath(`${fileOutDir}/${fileName}`);
        const fileTransformer = transformers?.filter((x) => x.fileRegex.test(fileName));
        if (fileTransformer.length > 0) {
          fileTransformer.forEach(async (x) => {
            if (x.fileRegex.test(fileChangedPath)) {
              const finalPathToRemove =
                x.pathTransformer?.(pathToRemove) ?? pathToRemove;
              fs.rmSync(finalPathToRemove, { force: true, recursive: true });
            }
          });
        }
        else
          fs.rmSync(pathToRemove, { force: true, recursive: true });
      } else {
        copyFile(fileSrcDir, fileName, fileOutDir, transformers, omit);
      }

      onEndSync?.(event, fileChangedPath);
    },
  );
};
