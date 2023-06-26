import type { Viewport } from "puppeteer";
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
