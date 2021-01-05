const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError(`No document found with this ID`, 404))
    }

    res.status(204).json({
      status: 'success',
      data: 'Document Successfully deleted',
    })
  })

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedDoc) {
      return next(new AppError('No document found with this ID', 404))
    }

    res.status(200).json({
      status: 'success',
      data: {
        updatedDoc,
      },
    })
  })

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    //const newTour = new Tour({})
    const document = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        document,
      },
    })
  })

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // In req.params all the parameters are stored
    // We can use multiple parameters
    // To make a parameter optional we will have to add '?' after it:
    // app.get('/api/v0/tours/:id/:x/:y?', (req, res) => {
    let query = Model.findById(req.params.id)
    if (populateOptions) query = query.populate(populateOptions)
    const document = await query

    if (!document) {
      return next(new AppError('No document found with this ID', 404))
    }

    res.status(200).send({
      status: 'success',
      data: { document },
    })
  })

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Get all reviews for specific tour( Nested GET reviews on tour )
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const documents = await features.query

    res.status(200).send({
      status: 'success',
      requestedAt: req.requestTime,
      results: documents.length,
      data: {
        data: documents,
      },
    })
  })
