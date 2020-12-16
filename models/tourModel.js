const mongoose = require('mongoose')
require('dotenv').config()

// Creating a schema for our database
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    // this is the validator
    required: [true, 'Tour must have a name'],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, 'Tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Tour must have group size mentioned'],
  },
  difficulty: {
    type: String,
    required: [true, 'Tour must have a difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQauntity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'Tour must include a summary'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Tour must include a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'Tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
})

// Creating a model
const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour

/*

Sample document creation

// Creating a document with help of the model
// Here the testTour is an instance of the Tour model, with that we can interact with DB
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
})

// Saving the document
testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.log(err))


  */
