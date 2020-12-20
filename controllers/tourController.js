const fs = require('fs')
const Tour = require('../models/tourModel')
const APIFeatures = require('./../utils/apiFeatures')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

exports.getAllTours = async (req, res) => {
  try {
    // Execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const allTours = await features.query

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
      message: err,
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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          num: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    })
  } catch (err) {
    res.status(400).send({
      status: 'failed',
      message: err,
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = Number(req.params.year)
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: '$startDates',
          },
          numOfTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numOfTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    })
  } catch (err) {}
}
