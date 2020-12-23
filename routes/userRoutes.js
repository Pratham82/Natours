const express = require('express')
const { signUp } = require('../controllers/authController')
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

// Auth routes
userRouter.post('/signup', signUp)

module.exports = userRouter
