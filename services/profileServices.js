var jwt       = require('jsonwebtoken')
var mongoose  = require('mongoose')
var validator = require('validator')

var Profile = require('../models/Profile')
var Wallet  = require('../models/wallet')
var utils   = require('./utils')
const fs    = require('fs')

var methods = {}

var privates = {
	checkUsername: (userId, username) => {
		return new Promise((resolve, reject) => {
			if (!username) {
				resolve()
			}
			else {
				Profile.findOne({username: username})
					.then(user => {
						if (!user || user._id.toString() === userId.toString()) {
							resolve()
						}
						else {
							reject({
								eCode: 400,
								eText: 'username exist!'
							})
						}
					})
					.catch(err => {
						reject({eCode: 500, eText: err})
					})
			}
		})
	}
}

methods.getProfile = (userId) => {
	return new Promise((resolve, reject) => {
		Promise.all([
			Profile.findOne({_id: userId}).lean(),
			Wallet.findOne({userId}, {userId: 1, wealth: 1})
		])
			.then(result => {
				let user   = result[0]
				let wallet = result[1]
				if (!user) {
					throw {eCode: 404, eText: 'user not found'}
				}
				else {
					user.wallet = wallet
					resolve(user)
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

methods.editProfile = ({user, username, password, confirmPassword, avatar, name, nickname, email, capital, divisa, preferedCrypto}) => {
	return new Promise((resolve, reject) => {
		Promise.all([
			Profile.findOne({_id: user._id}),
			privates.checkUsername(user._id, username)
		])
			.then(result => {
				let user = result[0]
				if (!user) {
					throw {eCode: 404, eText: 'user not found'}
				}
				if (email && !validator.isEmail(email)) {
					throw {eCode: 400, eText: 'invalid email format!'}
				}
				user.username                = username ? username : user.username
				user.name                    = name ? name : user.name
				user.nickname                = nickname ? nickname : user.nickname
				user.email                   = email ? email : user.email
				user.capital                 = capital ? capital : user.capital
				user.divisa                  = divisa ? divisa : user.divisa
				user.prefered_cryptocurrency = preferedCrypto ? preferedCrypto : user.prefered_cryptocurrency
				user.editDate                = new Date()
				
				if (password || confirmPassword) {
					if (password === confirmPassword) {
						user.password = password
					}
					else {
						throw {eCode: 400, eText: 'password does not match with confirmation!'}
					}
				}
				if (avatar) {
					if (user.avatar) {
						fs.unlink(__dirname + '/../upload/avatar/' + user.avatar, (err) => {
							if (err) {
								console.error('--------------------------')
								console.error('error in unlink file in edit profile')
								console.error('unlink avatar')
								console.error(err)
								console.error('--------------------------')
							}
						})
						user.avatar = avatar
					}
					else {
						user.avatar = avatar
					}
				}
				
				return user.save()
			})
			.then(user => {
				resolve(user)
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

module.exports = methods
