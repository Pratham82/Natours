const AppError = require('./../utils/appError')

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldError = err => {
  const message = `Duplicate field value found: ${err.keyValue.name}, The tour name must be unique`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  const errorsArr = Object.values(err.errors).map(val => val.message)
  const message = `Invalid input data: ${errorsArr.join('. ')}`

  console.log(errorsArr)
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: { ...err, name: err.name },
    message: err.message,
    stack: err.stack,
  })

// If error is operational send the message to the client, if not show generic error message
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  } else {
    console.log('Error ', err)
    res.status(500).json({
      status: 'Failed',
      message: 'Something went wrong',
    })
  }
}

module.exports = (err, req, res, next) => {
  console.log(err.stack)
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name }

    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldError(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)

    sendErrorProd(error, res)
  }
}
