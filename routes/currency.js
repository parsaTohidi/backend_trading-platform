var express = require('express')
var router  = express.Router()
var multer  = require('multer')
var shortid = require('shortid')

var currencyServices = require('../services/currencyServices')
var utils            = require('../services/utils')
const path           = require('path')

//------------------------------//
//			currency logo config
//------------------------------//
var logoStorage      = multer.diskStorage({
	destination: function (req, file, cb) {
		//TODO: change address*
		cb(null, __dirname + '/../upload/currency')
	},
	filename: function (req, file, cb) {
		var fileInfo = path.parse(file.originalname)
		let fileName = shortid.generate() + Date.now().toString().substring(6) + fileInfo.ext
		cb(null, fileName)
	}
})
var imageFilter        = function (req, file, callback) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/i)) {
		return callback(new Error('This file is not allowed to upload.'), false)
	}
	callback(null, true)
}
var uploadLogoConfig = multer({
	storage: logoStorage,
	fileFilter: imageFilter,
	limits: {fileSize: 200 * 1024 * 1024}
})
var uploadLogo       = uploadLogoConfig.fields([{name: 'logo', maxCount: 1}])

router.get('/:currencyId', utils.authentication(), (req, res, next) => {
	currencyServices.getCurrency(req.params.currencyId)
		.then(currency => {
			res.status(200).send({
				success: true,
				currency
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.get('/list/:page-:number?', utils.authentication(), (req, res, next) => {
	currencyServices.getcurrencyList(
		parseInt(req.params.page) - 1,
		parseInt(req.params.number),
		req.query
	)
		.then(currencies => {
			res.status(200).send({
				success: true,
				currencies
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.get('/growth/list/:currencyId/:period', utils.authentication(), (req, res, next) => {
	currencyServices.getCurrencyRates({
		currencyId: req.params.currencyId,
		period: req.params.period
	})
		.then(rates => {
			res.status(200).send({
				success: true,
				rates
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/new', utils.authentication(true), uploadLogo, (req, res, next) => {
	let logo = req.files && req.files['logo'] ? req.files['logo'][0].filename : null
	
	currencyServices.createCurrency({
		user: req.user,
		name: req.body.name,
		currentPrice: req.body.currentPrice,
		active: req.body.active,
		logo,
	})
		.then(currency => {
			res.status(200).send({
				success: true,
				currency
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/edit', utils.authentication(true), uploadLogo, (req, res, next) => {
	let logo = req.files && req.files['logo'] ? req.files['logo'][0].filename : null
	
	currencyServices.editCurrency({
		user: req.user,
		currencyId: req.body.currencyId,
		name: req.body.name,
		currentPrice: req.body.currentPrice,
		active: req.body.active,
		logo,
	})
		.then(currency => {
			res.status(200).send({
				success: true,
				currency
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/growth/new', utils.authentication(true), (req, res, next) => {
	currencyServices.createGrowthRate({
		user: req.user,
		currencyId: req.body.currencyId,
		rate: req.body.rate,
		direction: req.body.direction,
		date: req.body.date
	})
		.then(rate => {
			res.status(200).send({
				success: true,
				rate
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

module.exports = router
