const express = require('express')
const axios = require('axios')

const app = express()
const PORT = 3000

// 允许所有来源的跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/getHtmlFromUrl', async (req, res) => {
  // url从请求参数中获取
  try {
    const { url } = req.query
    const { data } = await axios.get(url)
    res.send(data)
  } catch (error) {
    console.error(error)
    res.status(500).send('Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
