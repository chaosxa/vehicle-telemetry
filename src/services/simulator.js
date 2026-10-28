let battery = 100;

// Produces one fake sensor reading. A real vehicle would send this data instead.
export function generateReading() {
  battery = battery <= 1 ? 100 : battery - Math.random() * 0.3; // "recharge" when empty
  return {
    vehicleId: 'VEH-001',
    speed: Math.round(40 + Math.random() * 60),
    battery: +battery.toFixed(1),
    engineTemp: Math.round(70 + Math.random() * 40),
    lat: 30.48 + Math.random() * 0.01,
    lng: 76.59 + Math.random() * 0.01,
  };
}
