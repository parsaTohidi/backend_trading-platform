var logger = require('morgan')

var createError  = require('http-errors')
var express      = require('express')
var path         = require('path')
var cookieParser = require('cookie-parser')
var redis        = require('redis')
var mongoose     = require('mongoose')
var cors         = require('cors')

// config file
var config = require('./config')

let app = express()

app.use(cors())

app.options('*', cors())

let server = require('http').Server(app)

// routes file
let profileRouter  = require('./routes/profile')
let generalRouter  = require('./routes/general')
let walletRouter   = require('./routes/wallet')
let currencyRouter = require('./routes/currency')

//data base connection
mongoose.connect(config.dbUrl, {useNewUrlParser: true}, (err) => {
	if (err) {
		console.error(err)
	}
	else {
		console.log('------------------')
		console.log('mongoose connect')
		console.log('------------------')
	}
})

global.client = redis.createClient()

client.on('error', (err) => {
	console.error(err)
})

client.on('connect', () => {
	console.log('------------------')
	console.log('redis connect')
	console.log('------------------')
})

// set log transport to ELK
// app.use(expressWinston.logger({
// 	transports: [
// 		elasticsearchTransport
// 	]
// }))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
//TODO: change address
app.use(express.static(path.join(__dirname, '../vue')))
// app.use('/apidoc', express.static(path.join(__dirname, './public/apidoc')))
app.use('/upload', express.static(path.join(__dirname, '../upload')))
app.set('trust proxy', 1)

// set routers
app.use('/', generalRouter)
app.use('/profile', profileRouter)
app.use('/wallet', walletRouter)
app.use('/currency', currencyRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	err.eCode = err.eCode ? err.eCode : err.status
	if (err.eCode) {
		res.status(err.eCode).send({
			success: false,
			error: err.eText
		})
	}
	else if (err.name && err.name === 'MulterError') {
		if (err.code === 'LIMIT_FILE_SIZE') {
			res.status(400).send({
				success: false,
				error: err.message
			})
		}
		else {
			res.status(500).send({
				success: false,
				error: err.message
			})
		}
	}
	else if (err.message) {
		if (err.message === 'This file is not allowed to upload.') {
			res.status(400).send({
				success: false,
				error: err.message
			})
		}
		else {
			res.status(500).send({
				success: false,
				error: err.message
			})
		}
	}
	else {
		res.status(500).send({
			success: false,
			error: err.message
		})
	}
	console.log(err)
	
})

process.on('unhandledRejection', (error, promise) => {
	console.log(' Oh! We forgot to handle a promise rejection here: ', promise)
	console.log(' The error was: ', error)
})

module.exports = {app: app, server: server}
