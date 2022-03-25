var mongoose = require('mongoose')

var Currency       = require('../models/currency')
var Wallet         = require('../models/wallet')
var Transaction    = require('../models/transaction')
var CryptoProperty = require('../models/cryptoProperty')
var utils          = require('./utils')

var methods = {}

methods.getTransactions = ({user, page, number}) => {
	return new Promise((resolve, reject) => {
	    Transaction.find()
			.sort({createdAt: 1})
			.skip(page * number)
			.limit(number)
			.populate('currencyId', ['name', 'logo', 'currentPrice'])
			.populate('swapTo', ['name', 'logo', 'currentPrice'])
			.then(transactions => {
				resolve(transactions)
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

methods.getProperties = ({user, page, number, query}) => {
	return new Promise((resolve, reject) => {
		CryptoProperty.find({userId: user._id})
			.skip(page * number)
			.limit(number)
			.populate('currencyId', ['name', 'logo', 'currentPrice'])
			.then(properties => {
				resolve(properties)
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

methods.buyCurrency = ({user, currencyId, amount}) => {
	return new Promise((resolve, reject) => {
		let totalPrice, wallet, currency
		Promise.all([
			Currency.findOne({_id: currencyId}),
			Wallet.findOne({userId: user._id})
		])
			.then(result => {
				currency = result[0]
				wallet   = result[1]
				if (!currency) {
					throw {eCode: 404, eText: 'currency not found!'}
				}
				if (!wallet) {
					throw {eCode: 404, eText: 'wallet not found!'}
				}
				else if (!currency.active) {
					throw {eCode: 400, eText: 'currency is not available now!'}
				}
				else {
					let networkFee = currency.currentPrice * 0.025
					totalPrice     = (amount * currency.currentPrice) + networkFee
					if (totalPrice > wallet.wealth) {
						throw {eCode: 400, eText: 'the calculated price is more than you can handle!'}
					}
					return CryptoProperty.findOne({userId: user._id, currencyId})
				}
			})
			.then(cryptoProperty => {
				wallet.wealth -= totalPrice
				let newTransaction = new Transaction({
					userId: user._id,
					currencyId: currency._id,
					currentPrice: currency.currentPrice,
					amount,
					createdAt: new Date(),
					type: 'buy',
					status: 'done'
				})
				if (cryptoProperty) {
					cryptoProperty.amount += amount
				}
				else {
					cryptoProperty = new CryptoProperty({
						userId: user._id,
						walletId: wallet._id,
						currencyId: currency._id,
						amount
					})
				}
				
				return Promise.all([
					wallet.save(),
					newTransaction.save(),
					cryptoProperty.save()
				])
			})
			.then(result => {
				console.log(result)
				resolve()
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

methods.sellOrSwapCurrency = ({user, propertyId, amount, type, currencyId}) => { // currencyId for swapping
	return new Promise((resolve, reject) => {
		let price, userProperty
		if (type !== 'sell' && type !== 'swap') {
			throw {eCode: 400, eText: 'invalid type of operation!'}
		}
		CryptoProperty.findOne({_id: propertyId})
			.then(property => {
				userProperty = property
				if (!property) {
					throw {eCode: 404, eText: 'property not found!'}
				}
				else if (amount > property.amount) {
					throw {eCode: 400, eText: 'this is more than your wallet!'}
				}
				else if (currencyId.toString() === property.currencyId.toString()) {
					throw {eCode: 400, eText: 'swap currencies are the same!'}
				}
				else {
					return Promise.all([
						Currency.findOne({_id: property.currencyId}),
						Wallet.findOne({userId: user._id}),
						type === 'swap' ? Currency.findOne({_id: currencyId}) : false,
						type === 'swap' ? CryptoProperty.findOne({currencyId, userId: user._id}) : false
					])
				}
			})
			.then(result => {
				let currency = result[0]
				let wallet   = result[1]
				let newTransaction, swapToCurr, swapToAmount,
					swapToProperty, newProperty
				if (!currency) {
					throw {eCode: 404, eText: 'currency not found!'}
				}
				else {
					price = currency.currentPrice * amount
					userProperty.amount -= amount
					if (type === 'sell') {
						wallet.wealth += price
						newTransaction = new Transaction({
							userId: user._id,
							currencyId: currency._id,
							currentPrice: currency.currentPrice,
							amount: amount,
							createdAt: new Date(),
							type: 'sell',
							status: 'done'
						})
					}
					else if (type === 'swap') {
						swapToCurr     = result[2]
						swapToProperty = result[3]
						swapToAmount   = price / swapToCurr.currentPrice
						if (swapToProperty) {
							swapToProperty.amount += swapToAmount
						}
						else {
							swapToProperty = new CryptoProperty({
								amount: swapToAmount,
								currencyId,
								userId: user._id,
								walletId: wallet._id
							})
						}
						newTransaction = new Transaction({
							userId: user._id,
							currencyId: currency._id,
							currentPrice: currency.currentPrice,
							swapTo: currencyId,
							swapToPrice: swapToCurr.currentPrice,
							amount,
							swapToAmount,
							createdAt: new Date(),
							type: 'swap',
							status: 'done'
						})
					}
					return Promise.all([
						userProperty.save(),
						newTransaction.save(),
						type === 'sell' ? wallet.save() : swapToProperty.save()
					])
				}
			})
			.then(result => {
				resolve()
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

module.exports = methods
