import { w3cwebsocket as WebSocketClient } from 'websocket';

const connect = () => {
  const hostURLWS = `ws://${location.hostname}:${location.port}`;
  const client = new WebSocketClient(hostURLWS, 'echo-protocol');

  client.onerror = function () {
    console.log('LS-Server Error');
  };

  client.onopen = function () {
    console.log('LS-Server Connected');
  };

  client.onclose = function () {
    console.log('LS-Server Connection Closed');
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