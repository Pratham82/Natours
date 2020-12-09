const express = require('express')

const app = express()

const PORT = 4000

// Simple Get request
app.get('/', (_, res) => {
  //res.status(200).send('Hello from express')
  res.json({
    name: 'Prathamesh Mali',
    message: 'Clean your code!!',
  })
})

app.post('/', (_, res) => res.send('You can POST to this endpoint'))

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
