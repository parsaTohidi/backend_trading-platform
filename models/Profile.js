var mongoose = require('mongoose')
mongoose.Promise = global.Promise

var Schema = mongoose.Schema
var bcrypt   = require('bcrypt-nodejs')

var profileSchema = new Schema ({
	name: {
		type: String
	},
	nickname: {
		type: String
	},
	avatar: {
		type: String
	},
	email: {
		type: String
	},
	username: {
		type: String
	},
	password: {
		type: String
	},
	capital: {
		type: String
	},
	divisa: {
		type: String
	},
	prefered_cryptocurrency: {
		type: String
	},
	editDate: {
		type: Date
	},
	adminAccess: {
		type: Boolean,
		default: false
	}
})

profileSchema.pre('save', function (next) {
	var user = this
	
	if (this.password && (this.isModified('password') || this.isNew)) {
		bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return next(err)
			}
			bcrypt.hash(user.password, salt, null, function (err, hash) {
				if (err) {
					return next(err)
				}
				user.password = hash
				next()
			})
		})
	}
	else {
		return next()
	}
})

profileSchema.methods.comparePassword = function (pwd, cb) {
	bcrypt.compare(pwd, this.password, function (err, isMatch) {
		if (err) {
			return cb(err)
		}
		return cb(null, isMatch)
	})
}

module.exports = mongoose.model('Profile', profileSchema)
