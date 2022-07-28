process.env.TMPDIR = 'tmp' // to avoid the EXDEV rename error, see http://stackoverflow.com/q/21071303/76173

const express = require('express')
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()
const uploader = require('./uploader-node.js')('tmp')
const app = express()
const fs = require('fs')

// Configure access control allow origin header stuff
const ACCESS_CONTROLL_ALLOW_ORIGIN = true

// Host
// app.use(express.static(__dirname + '/../docs'))

// Handle uploads through Uploader.js
app.post('/upload', multipartMiddleware, function (req, res) {
  uploader.post(req, function (status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier)
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'content-type')
    }

    if (status === 'done') {
      const s = fs.createWriteStream('./uploads/' + filename)
      s.on('finish', function () {
        res.status(200)
      })

      uploader.write(identifier, s, { end: true })
    } else {
      res.status(/^(partly_done|done)$/.test(status) ? 200 : 500)
    }

    const data = {
      result: true,
      message: ''
    }
    res.send(data)
  })
})

app.options('/upload', function (req, res) {
  console.log('OPTIONS')
  if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'content-type')
  }
  res.status(200).send()
})

// Handle status checks on chunks through Uploader.js
app.get('/upload', function (req, res) {
  uploader.get(req, function (status, filename, original_filename, identifier) {
    console.log('GET', status)
    if (ACCESS_CONTROLL_ALLOW_ORIGIN) {
      res.header('Access-Control-Allow-Origin', '*')
    }

    if (status == 'found') {
      status = 200
    } else {
      status = 204
    }

    res.status(status).send()
  })
})

app.get('/download/:identifier', function (req, res) {
  uploader.write(req.params.identifier, res)
})

app.listen(3000, function () {
  console.log('Server started...')
})
