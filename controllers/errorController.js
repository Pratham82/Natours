const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  })

// If error is operational send the message to the client, if not show generic error message
const sendErrorProd = (err, res) =>
  err.isOperational
    ? res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      })
    : res.status(500).json({
        status: 'Failed',
        message: 'Something went wrong',
      })

module.exports = (err, req, res, next) => {
  console.log(err.stack)
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res)
  }
}
