const express = require('express')
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController')
const userRouter = express.Router()
const useController = require('./../controllers/userController')
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
} = useController

userRouter.patch('/updateUserPassword', protect, updatePassword)
userRouter.patch('/updateMe', protect, updateMe)
// User routes
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

// Auth routes
userRouter.post('/signup', signUp)
userRouter.post('/login', login)

// Password routes
userRouter.post('/forgotPassword', forgotPassword)
userRouter.patch('/resetPassword/:token', resetPassword)

module.exports = userRouter
