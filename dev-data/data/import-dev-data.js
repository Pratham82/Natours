const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')
require('dotenv').config()

// Connect to mongodb
const DB = process.env.DATABASE_URI

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(res => console.log('Remote Mongo DB connected ✅'))

// Read Data
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
)

//Import Data into DB
const importData = async () => {
  try {
    // Crating multiple documents by passing array of documents
    await Tour.create(tours)
    await User.create(users, { validateBeforeSave: false })
    await Review.create(reviews)
    //    awat User.create(users)
    await console.log('Data Successfully loaded')
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

// Delete old Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('All Data Successfully deleted')
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

if (process.argv[2] === '--import') {
  importData()
} else if (process.argv[2] === '--delete') {
  deleteData()
}
