import path from 'path';
import express from 'express';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(express.static(path.join(config.rootDir, 'public')));

app.use('/api', routes);
app.use('/api', notFound);
app.use(errorHandler);

export default app;
