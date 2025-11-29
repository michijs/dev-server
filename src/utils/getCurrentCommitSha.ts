import fs from "fs";
import { join } from "path";

export const getCurrentCommitSha = () => {
  try {
    const headPath = join(".git", "HEAD");
    const headContent = fs.readFileSync(headPath, "utf-8").trim();

    if (headContent.startsWith("ref:")) {
      const ref = headContent.split(" ")?.[1];
      if (ref) {
        const refPath = join(".git", ref);
        return fs.readFileSync(refPath, "utf-8").trim(); }
    }
    return headContent;
  } catch {
    return "";
  }
};
