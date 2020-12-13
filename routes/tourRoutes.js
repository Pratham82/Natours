const express = require('express')
const tourRouter = express.Router()
const tourController = require('./../controllers/tourController')
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
} = tourController

tourRouter.param('id', checkID)

// Tour routes
tourRouter.route('/').get(getAllTours).post(checkBody, createTour)
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour)

module.exports = tourRouter
