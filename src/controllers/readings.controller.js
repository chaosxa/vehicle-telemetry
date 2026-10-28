import { Reading } from '../models/Reading.js';

export async function listReadings(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const readings = await Reading.find().sort({ time: -1 }).limit(limit);
  res.json(readings);
}

export async function latestReading(req, res) {
  const latest = await Reading.findOne().sort({ time: -1 });
  if (!latest) return res.status(404).json({ error: 'No data yet' });
  res.json(latest);
}

export async function readingStats(req, res) {
  const [stats] = await Reading.aggregate([
    {
      $group: {
        _id: null,
        avgSpeed: { $avg: '$speed' },
        maxSpeed: { $max: '$speed' },
        maxTemp: { $max: '$engineTemp' },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(stats || {});
}
