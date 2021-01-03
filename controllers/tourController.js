const fs = require('fs')
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
  next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
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
})

exports.getTour = catchAsync(async (req, res, next) => {
  // In req.params all the parameters are stored
  // We can use multiple parameters
  // To make a parameter optional we will have to add '?' after it:
  // app.get('/api/v0/tours/:id/:x/:y?', (req, res) => {
  const tour = await Tour.findById(req.params.id).populate('reviews')

  if (!tour) {
    return next(new AppError('No tour found with this ID', 404))
  }

  res.status(200).send({
    status: 'success',
    tours: tour,
  })
})

exports.createTour = catchAsync(async (req, res, next) => {
  //const newTour = new Tour({})
  const newTour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  })
})

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!updatedTour) {
    return next(new AppError('No tour found with this ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)

  if (!tour) {
    return next(new AppError('No tour found with this ID', 404))
  }

  res.status(203).json({
    status: 'success',
    data: 'Document Successfully deleted',
  })
})

exports.getTourStats = catchAsync(async (_, res, next) => {
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
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
})
