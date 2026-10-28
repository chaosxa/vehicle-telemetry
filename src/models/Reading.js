import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  vehicleId: String,
  speed: Number,
  battery: Number,
  engineTemp: Number,
  lat: Number,
  lng: Number,
  // TTL index: MongoDB deletes readings after 1 hour so the free database never fills up
  time: { type: Date, default: Date.now, expires: 3600 },
});

export const Reading = mongoose.model('Reading', readingSchema);
