const fs = require('fs')

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

exports.checkID = (req, res, next, val) => {
  const id = Number(req.params.id)
  if (id > tours.length) {
    return res
      .status(403)
      .json({ status: 'failed', message: 'Unable to find tour by this ID' })
  }
  next()
}

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'Failed',
      message: 'Please provied price and name',
    })
  }
  next()
}

exports.getAllTours = (req, res) => {
  res.status(200).send({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  })
}

exports.getTour = (req, res) => {
  // In req.params all the parameters are stored
  // We can use multiple parameters
  // To make a parameter optional we will have to add '?' after it:
  // app.get('/api/v0/tours/:id/:x/:y?', (req, res) => {
  const id = Number(req.params.id)
  const tour = tours.find(tour => tour.id === id)

  res.status(200).send({
    status: 'success',
    tours: tour,
  })
}

exports.createTour = (req, res) => {
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
      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tour: newTour,
        },
      })
    }
  )
}

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here.....>',
    },
  })
}

exports.deleteTour = (req, res) => {
  res.status(203).json({
    status: 'success',
    data: null,
  })
}
