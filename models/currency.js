var mongoose = require('mongoose')
const Schema = mongoose.Schema

const currencySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String
    },
    currentPrice: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Currency', currencySchema)
