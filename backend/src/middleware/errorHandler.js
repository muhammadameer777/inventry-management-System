export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]:', err);

  const status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected server error occurred.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
