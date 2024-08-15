class myError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || 500;
  }
}

const customError = (error, req, res, next) => {
  // Log the error details for debugging (could also use a logging library here)

  // Send the error response
  res.status(error.code || 500).json({
    message: error.message || "Internal Server Error",
  });
};
module.exports = { myError, customError };
