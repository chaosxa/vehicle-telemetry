import mongoose from 'mongoose';

const faultSchema = new mongoose.Schema({
  vehicleId: String,
  code: String,
  description: String,
  severity: String,
  reportedBy: String,
  time: { type: Date, default: Date.now },
});

export const Fault = mongoose.model('Fault', faultSchema);
