const express = require('express')
const fs = require('fs')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

const app = express()

const PORT = 4000

// Middlewares

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'))
}

// Using middleware(This will parse the req object)
app.use(express.json())
app.use(express.static(`${__dirname}/public`))

// Creating our own middleware function (next is passed as 3rd arg and its a convention to use name next)
/*app.use((req, res, next) => {
  console.log('Testing out middleware')
  next()
})*/

app.use((req, res, next) => {
  req.requestTime = new Date().toDateString()
  next()
})

// Handler functions

// Routes
/*
// @GET Tours
app.get('/api/v1/tours', getAllTours)

// @GET Individual Tour
app.get('/api/v1/tours/:id', getTour)

// @POST tours
app.post('/api/v1/tours', createTour)

// @PATCH update tours
app.patch('/api/v1/tours/:id', updateTour)

// @DELETE delete tours
app.delete('/api/v1/tours/:id', deleteTour)
  */

// Refactoring routes

// Connecting the router with our application
// Mounting routers on route
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app
