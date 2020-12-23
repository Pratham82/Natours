const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const bcrypt = require('bcrypt')
require('dotenv').config()

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  })

  const token = signToken(newUser._id)

  res.status(201).json({
    status: 'Successful',
    token,
    data: {
      user: newUser,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  // Read email and password from the body
  const { email, password } = req.body

  /*
    Checking the password of the user
    1) Check if the email and password exists
    2) Check if the user and password is correct
    3) If everything is correct send the token to the client
   */

  if (!email || !password) {
    return next(
      new AppError('Please provide both email and password to login', 400)
    )
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.checkCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  const token = signToken(user._id)
  res.status(200).json({
    status: 'Successful',
    token,
  })
})
