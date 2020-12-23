const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmedPassword: req.body.confirmedPassword,
  })

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

  res.status(201).json({
    status: 'Successful',
    token,
    data: {
      user: newUser,
    },
  })
})
