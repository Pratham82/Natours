const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { promisify } = require('util')
require('dotenv').config()

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  // Adding cookie
  res.cookie('jwt', token, cookieOptions)

  user.password = undefined

  res.status(statusCode).json({
    status: 'Successful',
    token,
    data: {
      user,
    },
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

  createSendToken(newUser, 201, res)
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

  createSendToken(user, 200, res)
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
    // Roles: admin, lead-guide have the access to delete users
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You Do not have permission to perform this action', 403)
      )
    }
    next()
  }
}

// Password Related

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError('There is no user with email address.', 404))
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    )
  }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  // 2. If the token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }

  user.password = req.body.password
  user.confirmedPassword = req.body.confirmedPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 3. Update cnagedPasword property for the const

  // 4. Log the user in, Send JWT
  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user.id).select('+password')

  // 2. Check if the POSTed current password is correct
  if (
    !(await user.checkCorrectPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 401))
  }

  // 3. If it is then update the password
  user.password = req.body.password
  user.confirmedPassword = req.body.confirmedPassword
  await user.save()

  // 4. Log user in, send JWT
  createSendToken(user, 200, res)
})
