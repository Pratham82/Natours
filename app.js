const express = require('express')
const fs = require('fs')

const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewReoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express()

const PORT = 4000

//####  Global Middlewares

// Adding helmet middleware for setting security HTTP headers
app.use(helmet())

// Development Logging
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'))
}

// This will allow 100 requests from same IP in one hour, if the limit is crossed then the user will receive an error
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
})

// Adding rate Limiter to the API route
app.use('/api', limiter)

// Using middleware(This will parse the req object)
app.use(express.json({ limit: '10kb' }))

// Date sanitization against NOSQL query injection (this will remove all the nosql queries from the req string )
app.use(mongoSanitize())

// Date sanitization against XSS attacks
app.use(xss())

// Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQauntity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
)

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Creating our own middleware function (next is passed as 3rd arg and its a convention to use name next)
/*app.use((req, res, next) => {
  console.log('Testing out middleware')
  next()
})*/

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toDateString()
  next()
})

// Handler functions

// Routes

// Connecting the router with our application
// Mounting routers on route
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

// 404 Route
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find the endpoint '${req.originalUrl}'`, 404))
})

// Error handling middleware
app.use(globalErrorHandler)

module.exports = app
