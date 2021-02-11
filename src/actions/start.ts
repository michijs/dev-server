import http from 'http';
import fs from 'fs';
import { server as WebSocketServer } from 'websocket';
import open from 'open';
import { config, hostURLHTTP, localURLHTTP, linkedPackages } from '../config/config';
import Timer from '../utils/timer';
import coloredString from '../utils/coloredString';
import { build } from './build';
import startWatchingDirs from '../utils/startWatchingDirs';
import { getPath } from '../utils/getPath';

export async function start() {

  const timer = new Timer();
  timer.startTimer();

  linkedPackages.forEach((path) => {
    console.log(coloredString(`  Linked package found at "${path}"`))
  })

  let connections = [];

  const sendRefresh = () => {
    connections.forEach(connection => {
      connection.sendUTF('refresh');
    })
  }

  await build();

  const server = http.createServer((req, res) => {
    try {
      if (req.url === '/' || req.url === '/index.html') {
        res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/index.html`), 'utf8'));
      } else {
        res.write(fs.readFileSync(getPath(`${config.esbuildOptions.outdir}/${req.url}`)));
      }
      res.statusCode = 200;
      res.end();
    } catch (ex) {
      res.statusCode = 404;
    }
  })
  server.listen(config.port, config.hostname, () => {
    console.log(`
  LS-Server running at:
  
  > Network:  ${coloredString(hostURLHTTP)}
  > Local:    ${coloredString(localURLHTTP)}

  ${coloredString(`Ready in ${timer.endTimer()}ms.`)}
  `);
    if (config.openBrowser) {
      open(hostURLHTTP);
    }
    startWatchingDirs(sendRefresh);
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  wsServer.on('request', function (request) {
    const connection = request.accept('echo-protocol', request.origin);
    connections.push(connection);
    connection.on('close', function () {
      connections = connections.filter(x => x !== connection);
    });
  });

}