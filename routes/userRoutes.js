const express = require('express')
const userRouter = express.Router()
const useController = require('./../controllers/userController')
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = useController

// User routes
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = userRouter
