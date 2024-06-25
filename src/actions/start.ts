import http from "http";
import fs from "fs";
import { config, connections } from "../config/config.js";
import coloredString from "../utils/coloredString.js";
import { getPath } from "../utils/getPath.js";
import open from "open";
import { context } from "esbuild";
import { getHostURL } from "../utils/getHostURL.js";
import { getLocalURL } from "../utils/getLocalURL.js";
import { watchPublicFolderPlugin } from "../config/plugins/watchPublicFolder.js";

export const start = async (callback: (selectedPort: number) => void) => {
  config.esbuildOptions.plugins?.push(watchPublicFolderPlugin);

  const buildContext = await context(config.esbuildOptions);
  const { host: esbuildHost, port: esbuildPort } = await buildContext.serve({
    servedir: config.esbuildOptions.outdir,
  });

  const server = http.createServer(async (req, res) => {
    if (req.url === "/esbuild") connections.push(res);
    const esbuildProxyRequestOptions = {
      hostname: esbuildHost,
      port: esbuildPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    // Forward each incoming request to esbuild
    const proxyReq = http.request(esbuildProxyRequestOptions, (proxyRes) => {
      // If esbuild returns "not found", send a custom 404 page
      if (!proxyRes.statusCode || proxyRes.statusCode === 404) {
        res.writeHead(200, { "Content-Type": "text/html" });
        // TODO: Find a better way to do this
        res.end(
          fs.readFileSync(
            getPath(
              `${config.esbuildOptions.outdir}/${config.public.indexName}`,
            ),
          ),
        );
        return;
      }

      // Otherwise, forward the response from esbuild to the client
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    // Forward the body of the request to esbuild
    req.pipe(proxyReq, { end: true });
  });

  let selectedPort: number = config.port;
  server.on("error", (e) => {
    // @ts-ignore
    if (e.code === "EADDRINUSE") {
      selectedPort++;
      server.listen(selectedPort);
    } else throw e;
  });

  server.on("listening", () => {
    const localURL = getLocalURL(selectedPort);
    console.log(`
    Server running at:
    
    > Network:  ${coloredString(getHostURL(selectedPort))}
    > Local:    ${coloredString(localURL)}`);
    callback(selectedPort);
    if (config.watch) buildContext.watch();
    if (config.openBrowser) open(localURL);
  });

  // First try
  server.listen(selectedPort);
};
