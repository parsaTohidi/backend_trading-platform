var jwt       = require('jsonwebtoken')
var mongoose  = require('mongoose')
var validator = require('validator')

var Profile = require('../models/Profile')
var Wallet  = require('../models/wallet')
var utils   = require('./utils')

var methods = {}

methods.register = ({name, nickname, avatar, email, username, password, capital, divisa}) => {
	return new Promise((resolve, reject) => {
		if (!validator.isEmail(email)) {
			throw {eCode: 400, eText: 'email address is incorrect!'}
		}
		Profile.findOne({$or: [{username}, {email}]})
			.then(user => {
				if (user) {
					throw {eCode: 400, eText: 'user with same email or username already exists'}
				}
				else {
					let newUser = new Profile({
						name,
						username,
						password
					})
					let newWallet = new Wallet({
						userId: newUser._id
					})
					
					if (nickname) {
						newUser.nickname = nickname
					}
					if (email) {
						newUser.email = email
					}
					if (capital) {
						newUser.capital = capital
					}
					if (divisa) {
						newUser.divisa = divisa
					}
					if (avatar) {
						newUser.avatar = avatar
					}
					return Promise.all([
						newUser.save(),
						newWallet.save()
					])
				}
			})
			.then(result => {
				let user = result[0]
				let token = utils.generateJWT({
					_id: user._id,
					email: user.email,
					name: user.name,
					username: user.username
				}, 'auth')
				resolve(token)
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

methods.login = ({emailOrUsername, password}) => {
	return new Promise((resolve, reject) => {
		if (!emailOrUsername) {
			throw {eCode: 400, eText: 'email or username is empty'}
		}
		if (!password) {
			throw {eCode: 400, eText: 'password is empty'}
		}
		Profile.findOne({$or: [{username: emailOrUsername}, {email: emailOrUsername}]})
			.then(user => {
				if (!user) {
					throw {eCode: 404, eText: 'user not found'}
				}
				else {
					user.comparePassword(password, (err, isMatch) => {
						if (err) {
							reject({eCode: 500, eText: err})
						}
						else if (!isMatch) {
							reject({eCode: 400, eText: 'email, username or password incorrect'})
						}
						else {
							let token = utils.generateJWT({
								_id: user._id,
								email: user.email,
								name: user.name,
								username: user.username
							}, 'auth')
							resolve({
								token,
								user
							})
						}
					})
				}
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
