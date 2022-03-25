var mongoose = require('mongoose')
const Schema = mongoose.Schema

var modelService = require('./modelServices')

const walletSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        set: modelService.toObjectId,
        ref: 'Profile'
    },
    wealth: { // default 100 USD
        type: Number,
        default: 100
    }
})

module.exports = mongoose.model('Wallet', walletSchema)
