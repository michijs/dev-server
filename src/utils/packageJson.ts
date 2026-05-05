import packageJsonData from "../../package.json" with { type: "json" };

export const packageJson = packageJsonData as {
  version: string;
  dependencies: Record<string, string>;
  [key: string]: unknown;
};
