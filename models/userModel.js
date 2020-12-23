const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please mention your name! '],
  },
  email: {
    type: String,
    required: [true, 'Please mention you email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  confirmedPassword: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      // Only works on create and save
      validator: function (el) {
        return el === this.password
      },
      message: 'Password and Confirmed password should match!',
    },
  },
})

// Encryption using the preSave mongo middleware
userSchema.pre('save', async function (next) {
  // Encrypt the password only when the password is changed or updated

  // If password is not modified dont do anything
  if (!this.isModified('password')) return next()

  //Encrypt the password
  this.password = await bcrypt.hash(this.password, 12)

  // Delete the confirmedPassword field, This field will not be persisted with the Database
  this.confirmedPassword = undefined
  next()
})

// Checking the password sent by users by the login rout, Instance method: Its a method that is going to be available  on all documents of a certain collection
// Here the candidate password is the password candidate passes in the body and the userPassword is the existing password in the DB
userSchema.methods.checkCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User
