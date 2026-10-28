import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/token.js';

export function createWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  // The browser connects to ws://host/?token=<jwt>; reject anyone without a valid token.
  wss.on('connection', (ws, req) => {
    try {
      const token = new URL(req.url, 'http://localhost').searchParams.get('token');
      verifyToken(token);
    } catch {
      ws.close(1008, 'Unauthorized');
    }
  });

  function broadcast(payload) {
    const message = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) client.send(message);
    });
  }

  return { wss, broadcast };
}
