const app = require('./app')
require('dotenv').config()

console.log(app.get('env'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
