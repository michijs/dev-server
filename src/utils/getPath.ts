import { normalize, sep } from 'path';

export function getPath(path) {
  return normalize(path).replace(/\\/g, sep);
}