class APIFeatures {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }
  filter() {
    // Filtering
    const queryObj = { ...this.queryStr }
    const excludedFields = ['page', 'sort', 'limit', 'fields']

    // 1A) Filtering out unwanted query parameters
    excludedFields.map(el => delete queryObj[el])

    //console.log(req.query, queryObj)

    // 1B) Advanced filtering
    let queryString = JSON.stringify(queryObj)

    //Replacing the query string with the mongo query
    queryString = queryString.replace(
      /(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    )

    this.query = this.query.find(JSON.parse(queryString))
    //let query = Tour.find(JSON.parse(queryString))
    return this
  }

  sort() {
    // 2) Sorting
    if (this.queryStr.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    // 3) Fields Limiting
    if (this.queryStr.fields) {
      const fields = req.query.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    // 4) Pagination
    // 1-10, page 1, 11-20  page 2 ....
    //Skip value will skips the provided results and limit value will only send the specified amount of results to the user

    const page = Number(this.queryStr.page) || 1
    const limit = Number(this.queryStr.limit) || 100
    const skip = (page - 1) * limit
    this.query = this.query.skip(skip).limit(limit)

    //if (this.queryStr.page) {
    //  const numTours = await Tour.countDocuments()
    //  if (skip >= numTours) throw new Error('This page does not exists')
    //}
    return this
  }
}
