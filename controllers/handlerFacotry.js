const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

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
