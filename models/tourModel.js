const mongoose = require('mongoose')
const slugify = require('slugify')
//const validator = require('validator')
require('dotenv').config()

// Creating a schema for our database
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // this is the validator
      required: [true, 'Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less than eqaul to 40 characters'],
      minlength: [10, 'A tour name must have more than eqaul to 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain alphabets'],
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Diffucult should be either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The rating must above 1.0'],
      max: [5, 'The rating must be below 5.0'],
    },
    ratingsQauntity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // Works only when we are creating a new doc
        validator: function (val) {
          return val < this.price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
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
    startLocation: {
      //Type: GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

// Example of embedding
//tourSchema.pre('save', async function (next) {
//  const guidesPromises = this.guides.map(async id => await User.findById(id))
//  this.guides = await Promise.all(guidesPromises)
//  next()
//})

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

// Populate the users with given user IDs
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  })
  next()
})

// Post middleware
tourSchema.post(/^find/, function (docs, next) {
  //console.log(docs)
  console.log(`Query took ${Date.now() - this.start} milliseconds`)
  next()
})

// Aggregation middleware
// Hiding the secret tour from our aggregation results
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  })
  console.log(this.pipeline())
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
