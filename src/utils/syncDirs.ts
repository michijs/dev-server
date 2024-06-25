import fs from "fs";
import path from "path";
import { Transformer, copyFile } from "../utils/copy.js";
import watch from "node-watch";
import { getPath } from "../utils/getPath.js";

export const syncDirs = (srcDir: string, outDir: string, transformers: Transformer[], omit?: RegExp[], onStartSync?: () => void, onEndSync?: Parameters<typeof watch.default>[2]) => {
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
      const fileOutDir = fileSrcDir.replace(srcDir, outDir);
      if (event === 'remove')
        transformers
          .forEach((x) => {
            if (x.fileRegex.test(fileChangedPath)) {
              fs.rmSync(
                getPath(`${fileOutDir}/${x.pathTransformer?.(fileName) ?? fileName}`),
                { force: true, recursive: true },
              )
            }
          })
      else
        copyFile(fileSrcDir, fileName, fileOutDir, transformers, omit);

      onEndSync?.(event, fileChangedPath)
    },
  );
}