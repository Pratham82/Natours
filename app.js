const express = require('express')
const fs = require('fs')

const app = express()

const PORT = 4000

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
  const tour = tours.find((tour) => tour.id === id)

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
    (err) => {
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
app.route('/api/v1/tours').get(getAllTours).get(createTour).post(createTour)

app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
