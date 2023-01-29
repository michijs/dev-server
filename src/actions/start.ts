import http from 'http';
import fs from 'fs';
import { config, hostURL, localURL } from '../config/config';
import coloredString from '../utils/coloredString';
import { getPath } from '../utils/getPath';
import open from 'open';
import { context } from 'esbuild';
import { setupBuild } from '../utils/setupBuild';

export const start = (callback: () => void) => {
  setupBuild()

  context(config.esbuildOptions).then(async buildContext => {
    const { host: esbuildHost, port: esbuildPort } = await buildContext.serve({
      servedir: config.esbuildOptions.outdir,
    })

    http.createServer(async (req, res) => {
      const esbuildProxyRequestOptions = {
        hostname: esbuildHost,
        port: esbuildPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      }

      // Forward each incoming request to esbuild
      const proxyReq = http.request(esbuildProxyRequestOptions, proxyRes => {
        // If esbuild returns "not found", send a custom 404 page
        if (!proxyRes.statusCode || proxyRes.statusCode === 404) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          // TODO: Find a better way to do this
          res.end(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${config.public.indexName}`)));
          return
        }

        // Otherwise, forward the response from esbuild to the client
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res, { end: true })
      })

      // Forward the body of the request to esbuild
      req.pipe(proxyReq, { end: true })

    }).listen(config.port)

    console.log(`
  Server running at:
  
  > Network:  ${coloredString(hostURL)}
  > Local:    ${coloredString(localURL)}`);
    callback();
    buildContext.watch()
    if (config.openBrowser)
      open(localURL);

  })
};