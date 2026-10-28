import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';

// Reject non-string values (e.g. {"$gt": ""}) so they never reach the database query.
function readCredentials(body) {
  const { username, password } = body || {};
  if (typeof username !== 'string' || typeof password !== 'string') return null;
  if (!username.trim() || !password) return null;
  return { username: username.trim(), password };
}

export async function register(req, res) {
  const creds = readCredentials(req.body);
  if (!creds) return res.status(400).json({ error: 'username and password are required' });
  if (creds.password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const passwordHash = await bcrypt.hash(creds.password, 10);
    const user = await User.create({ username: creds.username, passwordHash });
    res.status(201).json({ token: signToken(user), username: user.username });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Username already taken' });
    throw err;
  }
}

export async function login(req, res) {
  const creds = readCredentials(req.body);
  if (!creds) return res.status(400).json({ error: 'username and password are required' });

  const user = await User.findOne({ username: creds.username.toLowerCase() });
  const ok = user && (await bcrypt.compare(creds.password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Invalid username or password' });

  res.json({ token: signToken(user), username: user.username });
}
