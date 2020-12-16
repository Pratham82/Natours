const fs = require('fs')
const Tour = require('../models/tourModel')

exports.getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find({})

    res.status(200).send({
      status: 'success',
      requestedAt: req.requestTime,
      results: allTours.length,
      data: {
        allTours,
      },
    })
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    })
  }
}

exports.getTour = async (req, res) => {
  // In req.params all the parameters are stored
  // We can use multiple parameters
  // To make a parameter optional we will have to add '?' after it:
  // app.get('/api/v0/tours/:id/:x/:y?', (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)

    res.status(200).send({
      status: 'success',
      tours: tour,
    })
  } catch (err) {
    /* handle error */
    res.status(404).json({
      status: 'failed',
      message: err,
    })
  }
}

exports.createTour = async (req, res) => {
  //const newTour = new Tour({})
  try {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    })
  } catch (err) {
    res.status(400).send({
      status: 'failed',
      message: err,
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findOneAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    res.status(200).json({
      status: 'success',
      data: {
        updatedTour,
      },
    })
  } catch (err) {
    res.status(400).send({
      status: 'failed',
      message: 'Unable to update a tour',
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findOneAndDelete(req.params.id)
    res.status(203).json({
      status: 'success',
      data: 'Document Successfully deleted',
    })
  } catch (err) {
    res.status(400).json({
      message: 'Unable to Delete the tour',
    })
  }
}
