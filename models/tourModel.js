const mongoose = require('mongoose')
const slugify = require('slugify')
require('dotenv').config()

// Creating a schema for our database
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // this is the validator
      required: [true, 'Tour must have a name'],
      unique: true,
    },
    slug: String,
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
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
)

// Creating virtual properties (these propeties cannot be used in queries)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7
})

// ###### MongoDB middlewares #########

// 1) Document Middleware

// Pre middleware will run before an actual document is saved to the DB
// on 'this' keyword we have the access to the document we are saving
// Runs beore the .save() command and .create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// Pre save hook
//tourSchema.pre('save', function (next) {
//  console.log('Saving the new document...')
//  next()
//})

// Post middleware
//tourSchema.post('save', function (doc, next) {
//  console.log(doc)
//  next()
//})

// 2) Query middleware
// This middleware will run before the find query
// In here the 'this' keyword will not point to current document but the current query
// We will replace the 'find'  mwthod with regEx so we can target all the mongoose functions like finOne..
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })
  this.start = Date.now()
  next()
})

// Post middleware
tourSchema.post(/^find/, function (docs, next) {
  console.log(docs)
  console.log(`Query took ${Date.now() - this.start} milliseconds`)
  next()
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
