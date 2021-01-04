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
tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan)

// Tour routes
tourRouter.route('/').get(protect, getAllTours).post(createTour)
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = tourRouter
