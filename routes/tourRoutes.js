const express = require('express')
const tourRouter = express.Router()
const { protect, restrictTo } = require('./../controllers/authController')
const tourController = require('./../controllers/tourController')
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = tourController
const reviewRouter = require('./../routes/reviewReoutes')

// When tourRouter gets the following route it will be redirected to reviewRouter
tourRouter.use('/:tourId/reviews', reviewRouter)

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours)
tourRouter.route('/tour-stats').get(getTourStats)
tourRouter
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan)

// Tour routes
tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour)
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = tourRouter
