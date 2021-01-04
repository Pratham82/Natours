const fs = require('fs')
const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const User = require('./../models/userModel')
const factory = require('./handlerFacotry')

//const users = JSON.parse(
//  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
//)

// User Route Handlers
exports.getAllUsers = catchAsync(async (_, res) => {
  const users = await User.find()

  res.status(200).send({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
})

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Create error if user tries to update the password data in POST
  if (req.body.password || req.body.confirmedPassword) {
    return next(
      new AppError(
        'Password updates are not allowed with this routes please use /updateUserPassword route',
        400
      )
    )
  }

  // 2. Filter the unwanted user data which is not allowed to updated
  const filteredBody = filterObj(req.body, 'name', 'email')

  // 3. Update user document
  const updatedUser = await User.findOneAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })
  res.status(200).json({
    status: 'Successful',
    data: {
      user: updatedUser,
    },
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'Successful',
    data: null,
    message: 'User Successfully deleted',
  })
})

exports.createUser = factory.createOne(User)

exports.getUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)
