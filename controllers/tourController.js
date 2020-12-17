const fs = require('fs')
const Tour = require('../models/tourModel')

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // Filtering
    const queryObj = { ...req.query }
    const excludedFields = ['page', 'sort', 'limit', 'fileds']

    // 1A) Filtering out unwanted query parameters
    excludedFields.map(el => delete queryObj[el])

    //console.log(req.query, queryObj)

    // 1B) Advanced filtering
    let queryString = JSON.stringify(queryObj)

    //Replacing the query string with the mongo query
    queryString = queryString.replace(
      /(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    )

    let query = Tour.find(JSON.parse(queryString))

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    // 3) Fields Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    } else {
      query = query.select('-__v')
    }

    // 4) Pagination
    // 1-10, page 1, 11-20  page 2 ....
    //Skip value will skips the provided results and limit value will only send the specified amount of results to the user

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 100
    const skip = (page - 1) * limit
    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      const numTours = await Tour.countDocuments()
      if (skip >= numTours) throw new Error('This page does not exists')
    }

    // Execute query
    const allTours = await query

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
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
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
