var jwt      = require('jsonwebtoken')
var mongoose = require('mongoose')

var Currency   = require('../models/currency')
var GrowthRate = require('../models/growthRate')
var utils      = require('./utils')
const fs       = require('fs')

var methods = {}

methods.getCurrency = (currencyId) => {
	return new Promise((resolve, reject) => {
		Currency.findOne({_id: currencyId})
			.then(currency => {
				if (!currency) {
					throw {eCode: 404, eText: 'currency not found'}
				}
				else {
					resolve(currency)
				}
			})
			.catch(err => {
				if (err && err.eCode) {
					reject(err)
				}
				else {
					reject({eCode: 500, eText: err.toString()})
				}
			})
	})
}

methods.getcurrencyList = (page, number, query) => {
	return new Promise((resolve, reject) => {
		let queryString = {}
		if (query.text) {
			queryString['name'] = {$regex: '.*' + query.text + '.*', $options: 'i'}
		}
		
		Currency.find(queryString)
			.sort({name: 1})
			.skip(page * number)
			.limit(number)
			.lean()
			.then(currencies => {
				resolve(currencies)
			})
			.catch(err => {
				if (err && err.eCode) {
					reject(err)
				}
				else {
					reject({eCode: 500, eText: err.toString()})
				}
			})
	})
}

methods.getCurrencyRates = ({currencyId, period}) => {
	return new Promise((resolve, reject) => {
		let startDate = new Date()
		if (period === 'week') {
			startDate.setDate(startDate.getDate() - 7)
		}
		else if (period === 'month') {
			startDate.setMonth(startDate.getMonth() - 1)
		}
		else if (period === 'year') {
			startDate.setMonth(startDate.getMonth() - 12)
		}
		else {
			throw {eCode: 400, eText: 'invalid period!'}
		}
		GrowthRate.find({currencyId, date: {$gte: startDate, $lte: new Date()}})
			.then(rates => {
				resolve(rates)
			})
			.catch(err => {
				if (err && err.eCode) {
					reject(err)
				}
				else {
					reject({eCode: 500, eText: err.toString()})
				}
			})
	})
}

methods.createCurrency = ({user, name, currentPrice, active, logo}) => {
	return new Promise((resolve, reject) => {
		Currency.findOne({name})
			.then(currency => {
				if (currency) {
					throw {eCode: 400, eText: 'currency with this name already exists!'}
				}
				
				let newCurrency   = new Currency({
					name,
					currentPrice
				})
				let newGrowthRate = new GrowthRate({
					currencyId: newCurrency._id,
					rate: 100,
					date: new Date(),
					direction: 'posetive'
				})
				if (active !== undefined) {
					newCurrency.active = (active === true || active === 'true')
				}
				
				return Promise.all([
					newCurrency.save(),
					newGrowthRate.save()
				])
			})
			.then((result) => {
				let currnecy = result[0]
				resolve(currnecy)
			})
			.catch(err => {
				if (err.eText) {
					reject(err)
				}
				else {
					reject({eCode: 500, eText: err})
				}
			})
	})
}

methods.editCurrency = ({user, currencyId, name, currentPrice, active, logo}) => {
	return new Promise((resolve, reject) => {
		let promiseList = [], newGrowth
		Currency.findOne({_id: currencyId})
			.then(currency => {
				if (!currency) {
					throw {eCode: 404, eText: 'currency not found!'}
				}
				else {
					currency.name   = name ? name : currency.name
					currency.active = active ? active : currency.active
					
					if (logo) {
						if (currency.logo) {
							fs.unlink(__dirname + '/../upload/currency/' + currency.logo, (err) => {
								if (err) {
									console.error('--------------------------')
									console.error('error in unlink file in edit currency')
									console.error('unlink currency')
									console.error(err)
									console.error('--------------------------')
								}
							})
							currency.logo = logo
						}
						else {
							currency.logo = logo
						}
					}
					
					if (currentPrice && currentPrice !== currency.currentPrice) {
						let rate      = (currentPrice / currency.currentPrice) * 100
						let direction = (currentPrice > currency.currentPrice) ? 'posetive' : 'negative'
						let startDate = new Date()
						promiseList.push(
							GrowthRate.updateOne(
								{
									currencyId: currency._id,
									date: {$gte: startDate.setDate(startDate.getDate() - 1), $lte: new Date()}
								},
								{$set: {rate, direction}},
								{upsert: true, setDefaultsOnInsert: true}
							))
						currency.currentPrice = currentPrice
					}
					promiseList.push(currency.save())
					return Promise.all(promiseList)
				}
			})
			.then((result) => {
				console.log(result)
				resolve(result[1])
			})
			.catch(err => {
				console.log(err)
				if (err.eText) {
					reject(err)
				}
				else {
					reject({eCode: 500, eText: err})
				}
			})
	})
}

methods.createGrowthRate = ({user, currencyId, rate, direction, date}) => {
	return new Promise((resolve, reject) => {
		date          = new Date(date)
		let yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		
		if (rate > 5) {
			throw {eCode: 400, eText: 'changes above 5% are not allowed per day!'}
		}
		if (direction !== 'posetive' && direction !== 'negative') {
			throw {eCode: 400, eText: 'invalid direction!'}
		}
		if (date >= yesterday) {
			throw {eCode: 400, eText: 'not possible to edit rate in last 24 hours!'}
		}
			Currency.findOne({_id: currencyId})
				.then(currency => {
					if (!currency) {
						throw {eCode: 404, eText: 'currency not found'}
					}
					else {
						let newRate = new GrowthRate({
							currencyId,
							rate,
							direction,
							date
						})
						return newRate.save()
					}
				})
				.then(growthRate => {
					resolve(growthRate)
				})
				.catch(err => {
					if (err && err.eCode) {
						reject(err)
					}
					else {
						reject({eCode: 500, eText: err})
					}
				})
	})
}

module.exports = methods
