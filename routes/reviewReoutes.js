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

reviewRouter.use(protect)

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserIds, createReview)

reviewRouter
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)

module.exports = reviewRouter
