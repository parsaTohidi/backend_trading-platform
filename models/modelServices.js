var mongoose = require('mongoose')

var methods = {}

methods.toObjectId = function (val) {
    if (val && typeof val === 'string') {
        return mongoose.Types.ObjectId(val)
    }
    return val
}

module.exports = methods
