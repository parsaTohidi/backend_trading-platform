var mongoose       = require('mongoose')
const modelService = require('./modelServices')
const Schema       = mongoose.Schema

const growthRateSchema = new Schema({
	currencyId: {
		type: mongoose.Types.ObjectId,
		set: modelService.toObjectId,
		ref: 'Currency'
	},
	rate: { //percentage
		type: Number
	},
	date: {
		type: Date,
		default: Date.now()
	},
	direction: {
		type: String,
		enum: ['posetive', 'negative']
	}
})

module.exports = mongoose.model('GrowthRate', growthRateSchema)
