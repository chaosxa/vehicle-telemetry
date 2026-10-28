import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  vehicleId: String,
  type: String,
  message: String,
  value: Number,
  time: { type: Date, default: Date.now, expires: 86400 }, // kept for 24 hours
});

export const Alert = mongoose.model('Alert', alertSchema);
