const MaxSize = 256; // 1 << 8
const MaxFiles = 65536; // 1 << 16

export async function pngToIco(files: Buffer[], iconSizes: number[]) {
  if (files.length > MaxFiles)
    throw new Error(`It exceeds the maximum amount of files of ${MaxFiles}`);
  if (iconSizes.some((x) => x > MaxSize))
    throw new Error(`It exceeds the maximum icon size of ${MaxSize}`);

  const fileHeader = Buffer.from([0, 0, 1, 0, ...to2Bytes(files.length)]);

  let pngHeaderPos = fileHeader.byteLength + 16 * files.length;
  const icoBuffer = Buffer.concat([
    fileHeader,
    // Every png header
    ...files.map((x, i) => {
      const buffer = Buffer.from([
        iconSizes[i]!,
        iconSizes[i]!,
        0,
        0,
        0,
        0,
        0,
        0,
        ...to4Bytes(x.byteLength),
        ...to4Bytes(pngHeaderPos),
      ]);
      pngHeaderPos += x.byteLength;

      return buffer;
    }),
    // Every png file
    ...files,
  ]);

  return icoBuffer;
}

function to2Bytes(n: number): number[] {
  return [n & 255, (n >> 8) & 255];
}

function to4Bytes(n: number): number[] {
  return [...to2Bytes(n), (n >> 16) & 255, (n >> 24) & 255];
}
