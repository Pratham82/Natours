const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('../../models/tourModel')
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
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
)
//Import Data into DB
const importData = async () => {
  try {
    // Crating multiple documents by passing array of documents
    await Tour.create(tours)
    console.log('Data Successfully loaded')
    process.exit()
  } catch (err) {
    console.log(err)
  }
}

// Delete old Data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany()
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
