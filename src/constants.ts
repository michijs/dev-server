import type { ServerConfigFactoryProps, Viewport } from "./types.js";
export const assetsSizes = {
  webp: [24, 48, 72, 96, 128, 256, 512],
  png: [300, 512, 1080],
  screenshots: [
    // Phone 9:16
    { width: 720, height: 1280 },
    // Tablets 7 inches 16:9
    { width: 1280, height: 720 },
    // Desktop / tablet 10 inches 16:9
    { width: 1920, height: 1080 },
  ] satisfies Viewport[],
} as const;

export const defaultProductionConfig: ServerConfigFactoryProps<"PRODUCTION"> = {
  assetsSizes,
  icons: [
    ...assetsSizes.webp.map((x) => ({
      src: `/assets/generated/icon-${x}.webp`,
      sizes: `${x}x${x}`,
      type: "image/webp"
    })),
    ...assetsSizes.png.map((x) => ({
      src: `/assets/generated/icon-${x}.png`,
      sizes: `${x}x${x}`,
      type: "image/png"
    })),
    ...assetsSizes.webp.map((x) => ({
      src: `/assets/generated/icon-${x}-maskable.webp`,
      sizes: `${x}x${x}`,
      type: "image/webp",
      purpose: 'maskable'
    })),
    ...assetsSizes.png.map((x) => ({
      src: `/assets/generated/icon-${x}-maskable.png`,
      sizes: `${x}x${x}`,
      type: "image/png",
      purpose: 'maskable'
    })),
  ],
  environment: "PRODUCTION",
};
