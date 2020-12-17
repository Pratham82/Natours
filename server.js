const app = require('./app')
const mongoose = require('mongoose')
require('dotenv').config()

console.log(app.get('env'))

// Connect to mongodb
const DB = process.env.DATABASE_URI
const localDB = process.env.DATABASE_LOCAL
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(res => console.log('Remote Mongo DB connected ✅'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
