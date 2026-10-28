const COOLDOWN_MS = 10000; // don't repeat the same alert type within 10 seconds
const lastAlert = {};

export function checkAlerts(reading) {
  const found = [];

  if (reading.engineTemp > 105)
    found.push({ type: 'OVERHEAT', message: `Engine temperature high: ${reading.engineTemp}°C`, value: reading.engineTemp });
  if (reading.battery < 20)
    found.push({ type: 'LOW_BATTERY', message: `Battery low: ${reading.battery}%`, value: reading.battery });
  if (reading.speed > 90)
    found.push({ type: 'OVERSPEED', message: `Speed above limit: ${reading.speed} km/h`, value: reading.speed });

  const now = Date.now();
  return found
    .filter((a) => !lastAlert[a.type] || now - lastAlert[a.type] > COOLDOWN_MS)
    .map((a) => {
      lastAlert[a.type] = now;
      return { vehicleId: reading.vehicleId, ...a };
    });
}
