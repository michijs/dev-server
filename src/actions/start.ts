import http from 'http';
import fs from 'fs';
import { server as WebSocketServer } from 'websocket';
import { config, hostURLHTTP, localURLHTTP } from '../config/config';
import coloredString from '../utils/coloredString';
import { build } from './build';
import { getPath } from '../utils/getPath';
import open from 'open';

const mimeTypes = {
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  json: 'application/json',
  js: 'text/javascript',
  css: 'text/css'
};

export const start = (callback: () => void) => {
  let connections = [];
  let server: http.Server | undefined;

  const createServer = () => {
    server = http.createServer((req, res) => {
      try {
        const mimeType = mimeTypes[req.url.split('.').pop()];
        if (mimeType) {
          res.setHeader('Content-Type', mimeType);
        }
        if (req.url === '/' || req.url === `/${config.public.indexName}` || req.url.split('.').length === 1) {
          res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${config.public.indexName}`)));
        } else {
          res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${req.url}`)));
        }
        res.statusCode = 200;
      } catch (ex) {
        console.log(ex);
        res.statusCode = 404;
      }
      res.end();
    });
    server.listen(config.port, () => {
      console.log(`
LS-Server running at:

> Network:  ${coloredString(hostURLHTTP)}
> Local:    ${coloredString(localURLHTTP)}`);
      callback();
      if (config.openBrowser) {
        open(hostURLHTTP);
      }
    });

    const wsServer = new WebSocketServer({
      httpServer: server,
      autoAcceptConnections: false
    });

    wsServer.on('request', (request) => {
      const connection = request.accept('echo-protocol', request.origin);
      connections.push(connection);
      connection.on('close', () => {
        connections = connections.filter(x => x !== connection);
      });
    });
  };

  const successfullyBuilt = () => {
    if (!server && connections.length === 0) {
      createServer();
    } else {
      connections.forEach(connection => {
        connection.sendUTF('refresh');
      });
    }
  };

  build(successfullyBuilt, true);
};