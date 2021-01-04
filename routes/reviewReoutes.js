const express = require('express')
const { protect, restrictTo } = require('./../controllers/authController')
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
  setTourUserIds,
} = require('./../controllers/reviewController')

const reviewRouter = express.Router({ mergeParams: true }) // This will merge the parameters, so we can access the data coming from the different routers

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview)

reviewRouter
  .route('/:id')
  .delete(protect, restrictTo('user'), deleteReview)
  .patch(protect, restrictTo('user'), updateReview)
  .get(protect, restrictTo('user'), getReview)

module.exports = reviewRouter
