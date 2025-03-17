import type { Plugin } from "esbuild";
import { build as esbuild } from "esbuild";
import { config } from "../config.js";
import path from "path";

export const cssPlugin: Plugin = {
  name: "css import assertions",
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      try {
        // Check if CSS is from a library (inside node_modules)
        let layerName: string | undefined;
        const parts = args.path.split(path.sep);

        const nodeModulesIndex = parts.lastIndexOf("node_modules");
        if (nodeModulesIndex !== -1 && parts[nodeModulesIndex + 1]) {
          layerName = parts[nodeModulesIndex + 1].replace(
            /[^a-zA-Z0-9_-]/g,
            "-",
          ); // Sanitize name
        }
        const result = await esbuild({
          ...config.esbuildOptions,
          splitting: false,
          outdir: undefined,
          inject: undefined,
          plugins: undefined,
          write: false,
          entryPoints: [args.path!],
          legalComments: "inline",
          // TODO: Add other image formats
          loader: {
            ".svg": "dataurl",
            ".gif": "dataurl",
            ".png": "dataurl",
            ".webp": "dataurl",
          },
          define: undefined,
        });
        const processedCss = result.outputFiles?.[0].text ?? "";
        const contents = `
      const styles = new CSSStyleSheet();
      styles.replaceSync(\`
      ${layerName ? `@layer ${layerName} {\n${processedCss}\n}` : processedCss}
      \`);
      export default styles;`;
        return { contents };
      } catch (ex) {
        console.error(ex);
        throw ex;
      }
    });
  },
};
