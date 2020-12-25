const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const bcrypt = require('bcrypt')
const { promisify } = require('util')
require('dotenv').config()

const signToken = (id) => {
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
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
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

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get the token and check if its present
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }
  //  console.log(`Token: ${token}`)

  if (!token) {
    return next(
      new AppError('You are not logged in, Please log in to get Access', 401)
    )
  }

  // 2. Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3. Check if the user still existes
  const currentUser = await User.findById({ _id: decoded.id })

  if (!currentUser) {
    return next(
      new AppError('The user belonging tp this user no longer exists', 401)
    )
  }

  // 4. Check if user recently changed the password after the token was issued
  //  console.log(user)
  //console.log(decoded.iat)
  if (currentUser.checkPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently chnaged password! Please login again', 401)
    )
  }

  // Grant access to protected route
  req.user = currentUser
  next()
})

// Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Roles: admin, lead-guide havs the access to delete users
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You Do not have permission to perform this action', 403)
      )
    }
    next()
  }
}
