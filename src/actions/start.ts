import http from 'http';
import fs from 'fs';
import { server as WebSocketServer } from 'websocket';
import { config, hostURLHTTP, localURLHTTP } from '../config/config';
import coloredString from '../utils/coloredString';
import { build } from './build';
import { getPath } from '../utils/getPath';
import open from 'open';

export const start = (callback: () => void) => {
  let connections = [];

  const createServer = () => {
    const server = http.createServer((req, res) => {
      try {
        if (req.url === '/' || req.url === `/${config.public.indexName}`) {
          res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${config.public.indexName}`)));
        } else {
          res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${req.url}`)));
        }
        res.statusCode = 200;
        res.end();
      } catch (ex) {
        res.statusCode = 404;
      }
    });
    server.listen(config.port, config.hostname, () => {
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
    if (connections.length === 0) {
      createServer();
    } else {
      connections.forEach(connection => {
        connection.sendUTF('refresh');
      });
    }
  };

  build(successfullyBuilt, true);
};