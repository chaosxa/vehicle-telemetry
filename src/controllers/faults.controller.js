import { Fault } from '../models/Fault.js';
import { FAULT_CODES } from '../data/faultCodes.js';

export async function createFault(req, res) {
  const { vehicleId, code } = req.body || {};
  if (typeof vehicleId !== 'string' || typeof code !== 'string' || !vehicleId || !code)
    return res.status(400).json({ error: 'vehicleId and code are required' });

  const upper = code.toUpperCase();
  const info = FAULT_CODES[upper];
  if (!info) return res.status(404).json({ error: 'Unknown fault code' });

  const fault = await Fault.create({
    vehicleId,
    code: upper,
    ...info,
    reportedBy: req.user.username,
  });
  res.status(201).json(fault);
}

export async function listFaults(req, res) {
  const faults = await Fault.find({ vehicleId: req.params.vehicleId }).sort({ time: -1 });
  res.json(faults);
}
