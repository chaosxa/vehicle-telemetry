import http from 'http';
import { config } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import app from './src/app.js';
import { createWebSocketServer } from './src/websocket/index.js';
import { startTelemetryLoop } from './src/services/telemetryLoop.js';

try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  process.exit(1);
}

const server = http.createServer(app);
const { broadcast } = createWebSocketServer(server);
startTelemetryLoop(broadcast);

server.listen(config.port, () => console.log(`Running on port ${config.port}`));
