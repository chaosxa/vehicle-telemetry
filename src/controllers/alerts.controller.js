import { Alert } from '../models/Alert.js';

export async function listAlerts(req, res) {
  const alerts = await Alert.find().sort({ time: -1 }).limit(50);
  res.json(alerts);
}
