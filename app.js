const express = require('express')
const fs = require('fs')
const morgan = require('morgan')

const app = express()

const PORT = 4000

// Middlewares

app.use(morgan('dev'))

// Using middleware(This will parse the req object)
app.use(express.json())

// Creating our own middleware function (next is passed as 3rd arg and its a convention to use name next)
app.use((req, res, next) => {
  console.log('Hello from middleware')
  next()
})

app.use((req, res, next) => {
  req.requestTime = new Date().toDateString()
  next()
})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
)

// Handler functions

const getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  })
}

const getTour = (req, res) => {
  // In req.params all the parameters are stored
  // We can use multiple parameters
  // To make a parameter optional we will have to add '?' after it:
  // app.get('/api/v1/tours/:id/:x/:y?', (req, res) => {
  const id = Number(req.params.id)
  const tour = tours.find(tour => tour.id === id)

  if (!tour) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'Unable to find tour by this ID' })
  }

  res.status(200).send({
    status: 'success',
    tours: tour,
  })
}

const createTour = (req, res) => {
  const newID = tours[tours.length - 1].id + 1
  const newTour = Object.assign({ id: newID }, req.body)
  console.log(newTour)

  // Add newTour to our JSON database
  tours.push(newTour)

  // We are in a callback function so we are not going to block the even loop, so it wll processed in the background
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      // if (err) return 'Unable to write to file'
      res.status(201).json({
        status: 'success',
        results: tours.length,
        data: {
          tour: newTour,
        },
      })
    }
  )
}

const updateTour = (req, res) => {
  const id = Number(req.params.id)

  if (id > tours.length) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'Unable to find tour by this ID' })
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here.....>',
    },
  })
}

const deleteTour = (req, res) => {
  const id = Number(req.params.id)

  if (id > tours.length) {
    return res
      .status(404)
      .json({ status: 'failed', message: 'Unable to find tour by this ID' })
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
}

// User Route Handlers
const getAllUsers = (_, res) => {
  res.status(200).send({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
}

const createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

const getUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

const updatUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

const deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

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
// Creating Routers
const tourRouter = express.Router()
const userRouter = express.Router()

// Tour routes
tourRouter.route('/').get(getAllTours).post(createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

// User routes
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updatUser).delete(deleteUser)

// Connecting the router with our application
// Mounting routers on route
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
