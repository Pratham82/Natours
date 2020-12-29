const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

// Add passwordChangedAt propety to the user
userSchema.pre('save', function (next) {
  // If the user is newly created or not mdified then don't do anything
  if (!this.isModified('password') || this.isNew) return next()

  // If user is modified add the property
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Dont send inactive users
userSchema.pre(/^find/, function (next) {
  //This refers to the current query
  this.find({ active: { $ne: false } })
  next()
})

// Checking the password sent by users by the login route, Instance method: Its a method that is going to be available  on all documents of a certain collection
// Here the candidate password is the password candidate passes in the body and the userPassword is the existing password in the DB
userSchema.methods.checkCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.checkPasswordAfter = function (JWTTimestamp) {
  //  console.log('checkPasswordAfter called')
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )
    return JWTTimestamp < changedTimeStamp
  }

  // If password not changed return false
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  // encrypt token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  console.log({ resetToken }, this.passwordResetToken)

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}
const User = mongoose.model('User', userSchema)

module.exports = User
