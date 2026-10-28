import { FAULT_CODES } from '../data/faultCodes.js';

export function lookupCode(req, res) {
  const code = req.params.code.toUpperCase();
  const info = FAULT_CODES[code];
  if (!info) return res.status(404).json({ error: 'Unknown fault code' });
  res.json({ code, ...info });
}
