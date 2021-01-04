const express = require('express')
const { protect, restrictTo } = require('./../controllers/authController')
const {
  getAllReviews,
  createReview,
} = require('./../controllers/reviewController')

const reviewRouter = express.Router({ mergeParams: true }) // This will merge the parameters, so we can access the data coming from the different routers
reviewRouter
  .route('/')
  .get(protect, restrictTo('user'), getAllReviews)
  .post(protect, restrictTo('user'), createReview)

module.exports = reviewRouter
