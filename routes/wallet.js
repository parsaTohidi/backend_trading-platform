var express = require('express')
var router  = express.Router()
var shortid = require('shortid')

var walletServices = require('../services/walletServices')
var utils          = require('../services/utils')
const path         = require('path')

router.get('/transactions/list/:page-:number', utils.authentication(), (req, res, next) => {
	walletServices.getTransactions({
		user: req.user,
		page: parseInt(req.params.page) - 1,
		number: parseInt(req.params.number)
	})
		.then(transactions => {
			res.status(200).send({
				success: true,
				transactions
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.get('/properties/list/:page-:number', utils.authentication(), (req, res, next) => {
	walletServices.getProperties({
		user: req.user,
		page: parseInt(req.params.page) - 1,
		number: parseInt(req.params.number),
		query: req.query
	})
		.then(properties => {
			res.status(200).send({
				success: true,
				properties
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/buy', utils.authentication(), (req, res, next) => {
	
	walletServices.buyCurrency({
		user: req.user,
		currencyId: req.body.currencyId,
		amount: Number(req.body.amount)
	})
		.then(() => {
			res.status(200).send({
				success: true
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/sell', utils.authentication(), (req, res, next) => {
	
	walletServices.sellOrSwapCurrency({
		user: req.user,
		propertyId: req.body.propertyId,
		amount: Number(req.body.amount),
		type: req.body.type,
		currencyId: req.body.currencyId   // on swap
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

module.exports = router
