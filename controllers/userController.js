const fs = require('fs')
const catchAsync = require('../utils/catchAsync')
const User = require('./../models/userModel')

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

exports.createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.getUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.updateUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}
