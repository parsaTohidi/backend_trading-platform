var mongoose = require('mongoose')
const Schema = mongoose.Schema
const modelService = require('./modelServices')

const propertySchema = new Schema({
    walletId: {
        type: mongoose.Types.ObjectId,
        set: modelService.toObjectId,
        ref: 'Wallet'
    },
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
    amount: {
        type: Number
    }
})

module.exports = mongoose.model('Property', propertySchema)
