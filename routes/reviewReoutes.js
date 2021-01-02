const express = require('express')
const reviewRouter = express.Router()
const { protect, restrictTo } = require('./../controllers/authController')
const {
  getAllReviews,
  createReview,
} = require('./../controllers/reviewController')

reviewRouter
  .route('/')
  .get(protect, restrictTo('user'), getAllReviews)
  .post(protect, restrictTo('user'), createReview)

module.exports = reviewRouter
