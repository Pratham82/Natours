const express = require('express')
const fs = require('fs')

const app = express()

const PORT = 4000
// Using middleware(This will parse the req object)
app.use(express.json())

// Simple Get request
//app.get('/', (_, res) => {
//  //res.status(200).send('Hello from express')
//  res.json({
//    name: 'Prathamesh Mali',
//    message: 'Clean your code!!',
//  })
//})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

// @GET Tours
app.get('/api/v1/tours', (_, res) => {
  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  })
})

// @POST tours
app.post('/api/v1/tours', (req, res) => {
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
})

app.post('/', (_, res) => res.send('You can POST to this endpoint'))

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
