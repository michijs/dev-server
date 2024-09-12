import fs from "fs";
import { join } from "path";

export const getCurrentCommitSha = () => {
  try {
    const headPath = join(".git", "HEAD");
    const headContent = fs.readFileSync(headPath, "utf-8").trim();

    if (headContent.startsWith("ref:")) {
      const refPath = join(".git", headContent.split(" ")[1]);
      return fs.readFileSync(refPath, "utf-8").trim();
    } else {
      return headContent;
    }
  } catch {
    return "";
  }
};
