var mongoose = require('mongoose')
const Schema = mongoose.Schema

var modelService = require('./modelServices')

const transactionSchema = new Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		set: modelService.toObjectId,
		ref: 'Profile'
	},
	currencyId: {
		type: mongoose.Types.ObjectId,
		set: modelService.toObjectId,
		ref: 'Currency'
	},
	swapTo: {  // on swap
		type: mongoose.Types.ObjectId,
		set: modelService.toObjectId,
		ref: 'Currency'
	},
	swapToPrice: {  // on swap
		type: Number
	},
	swapToAmount: {  // on swap
		type: Number
	},
	currencyPrice: {
		type: Number
	},
	amount: {
		type: Number
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	type: { // buy - sell - swap
		type: String
	},
	status: { // failed - done
		type: String
	}
})

module.exports = mongoose.model('Transaction', transactionSchema)
