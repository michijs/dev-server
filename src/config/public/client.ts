import { w3cwebsocket as WebSocketClient } from 'websocket';

const connect = () => {
  const protocol = location.protocol === 'http:' ? 'ws': 'wss';
  const hostURLWS = `${protocol}://${location.hostname}:${location.port}`;
  const client = new WebSocketClient(hostURLWS, 'echo-protocol');

  client.onerror = function () {
    console.log('Server Error');
  };

  client.onopen = function () {
    console.log('Server Connected');
  };

  client.onclose = function () {
    console.log('Server Connection Closed');
    setTimeout(() => {
      connect();
    }, 5000);
  };

  client.onmessage = function (e) {
    if (typeof e.data === 'string' && e.data === 'refresh') {
      window.location.reload();
    }
  };
};
connect();