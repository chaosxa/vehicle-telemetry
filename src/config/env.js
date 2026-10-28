import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Project root (two levels above src/config). Loading .env from here means it
// works no matter which folder you start the server from.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error(`Create ${path.join(rootDir, '.env')} (see .env.example).`);
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '2h',
  rootDir,
};
