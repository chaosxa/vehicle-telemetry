import { Reading } from '../models/Reading.js';
import { Alert } from '../models/Alert.js';
import { generateReading } from './simulator.js';
import { checkAlerts } from './alertService.js';

// Every second: create a reading, save it, check alert rules, push to connected browsers.
export function startTelemetryLoop(broadcast, intervalMs = 1000) {
  return setInterval(async () => {
    try {
      const reading = await Reading.create(generateReading());
      const alerts = checkAlerts(reading);
      if (alerts.length) await Alert.insertMany(alerts);
      broadcast({ reading, alerts });
    } catch (err) {
      console.error('Telemetry tick failed:', err.message);
    }
  }, intervalMs);
}
