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
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'Tour must have a price'],
  },
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
