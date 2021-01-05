const express = require('express')
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
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
  deleteMe,
  getMe,
} = useController

// Auth routes
userRouter.post('/signup', signUp)
userRouter.post('/login', login)

// Password routes
userRouter.post('/forgotPassword', forgotPassword)
userRouter.patch('/resetPassword/:token', resetPassword)

// Instead of individaually using protect method we can pass it as middleware in our router
userRouter.use(protect)

userRouter.get('/me', getMe, getUser)
userRouter.patch('/updateUserPassword', updatePassword)
userRouter.patch('/updateMe', updateMe)
userRouter.delete('/deleteMe', deleteMe)

userRouter.use(restrictTo('admin'))

// User routes
userRouter.route('/').get(getAllUsers).post(createUser)
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser)

module.exports = userRouter
