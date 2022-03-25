var jwt      = require('jsonwebtoken')
var mongoose = require('mongoose')

var Profile = require('../models/Profile')

var methods = {}

methods.generateJWT = (payload, secretKey) => {
	let token
	token = jwt.sign(payload, 'auth')
	return token
}

methods.verifyJWT = (token, secretKey) => {
	return new Promise((resolve, reject) => {
		try {
			let decoded = jwt.verify(token, 'auth')
			resolve(decoded)
		} catch (err) {
			reject(err)
		}
	})
}

methods.authentication = function (adminAccess) {
	return function (req, res, next) {
		
		let token
		
		if (req.cookies.token && req.cookies.token !== 'undefined') {
			token = req.cookies.token
		}
		else if (req.headers.token && req.headers.token !== 'undefined') {
			token = req.headers.token
		}
		
		if (token) {
			// let token = req.headers.token
			methods.verifyJWT(token, 'auth')
				.then(decoded => {
					if (decoded) {
						Profile.findOne({_id: decoded._id})
							.then(user => {
								if (user) {
									if ((adminAccess && user.adminAccess) || !adminAccess) {
										req.user = user
										next()
									}
									else {
										res.clearCookie('token')
										
										res.status(401).send({
											success: false,
											'error': 'unautherized'
										})
									}
								}
								else {
									res.clearCookie('token')
									
									res.status(401).send({
										success: false,
										'error': 'unautherized'
									})
								}
							})
							.catch(err => {
								res.status(500).send({
									success: false,
									error: err
								})
							})
					}
					else {
						res.clearCookie('token')
						
						res.status(401).send({
							success: false,
							'error': 'unautherized'
						})
					}
				})
				.catch(err => {
					console.log(err)
					if (err && (err.message === 'invalid signature' || err.message === 'jwt malformed')) {
						res.clearCookie('token')
						res.status(401).send({
							success: false,
							'error': 'unautherized'
						})
					}
					else {
						res.status(500).send({
							success: false,
							'error': err.toString()
						})
					}
				})
		}
		else {
			res.status(401).send({
				success: false,
				'error': 'unautherized'
			})
		}
		
	}
}

module.exports = methods
