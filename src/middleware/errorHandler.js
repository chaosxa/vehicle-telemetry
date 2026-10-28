export function notFound(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

// Express recognises error middleware by its four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.expose ? err.message : 'Server error' });
}
