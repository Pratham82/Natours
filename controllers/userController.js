const fs = require('fs')

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
)

// User Route Handlers
exports.getAllUsers = (_, res) => {
  res.status(200).send({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  })
}

exports.createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.getUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.updateUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    msg: 'Yet to be implemented',
  })
}
