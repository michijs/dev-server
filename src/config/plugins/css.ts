import { build as esbuild } from "esbuild";
import { config } from "../config.js";

export const cssPlugin = {
  name: 'css import assertions',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      try {
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
          loader: { '.svg': 'dataurl', '.gif': 'dataurl', '.png': 'dataurl', '.webp': 'dataurl' },
          define: undefined,
        });
        const contents = `
      const styles = new CSSStyleSheet();
      styles.replaceSync(\`${result.outputFiles?.[0].text ?? ""}\`);
      export default styles;`;
        return { contents };
      } catch (ex) {
        console.error(ex);
        throw ex;
      }
    }
    )
  }
}