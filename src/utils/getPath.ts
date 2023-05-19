import { normalize, sep } from "path";

export function getPath(path: string) {
  return normalize(path).replace(/\\/g, sep);
}
