var express = require('express')
var router  = express.Router()

var generalServices = require('../services/generalServices')
var utils           = require('../services/utils')
const multer        = require('multer')
const path          = require('path')
const shortid       = require('shortid')


//------------------------------//
//			profile avatar config
//------------------------------//
var avatarStorage      = multer.diskStorage({
	destination: function (req, file, cb) {
		//TODO: change address*
		cb(null, __dirname + '/../upload/avatar')
	},
	filename: function (req, file, cb) {
		var fileInfo = path.parse(file.originalname)
		let fileName = shortid.generate() + Date.now().toString().substring(6) + fileInfo.ext
		cb(null, fileName)
	}
})
var imageFilter        = function (req, file, callback) {
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/i)) {
		return callback(new Error('This file is not allowed to upload.'), false)
	}
	callback(null, true)
}
var uploadAvatarConfig = multer({
	storage: avatarStorage,
	fileFilter: imageFilter,
	limits: {fileSize: 200 * 1024 * 1024}
})
var uploadAvatar       = uploadAvatarConfig.fields([{name: 'avatar', maxCount: 1}])

router.post('/register', uploadAvatar, (req, res, next) => {
	let avatar = req.files && req.files['avatar'] ? req.files['avatar'][0].filename : null
	generalServices.register({
		name: req.body.name,
		nickname: req.body.nickname,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		capital: req.body.capital,
		divisa: req.body.divisa,
		avatar,
	})
		.then(token => {
			res.status(200).send({
				success: true,
				token
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/login', (req, res, next) => {
	
	generalServices.login({
		emailOrUsername: req.body.emailOrUsername,
		password: req.body.password,
	})
		.then(result => {
			res.status(200).send({
				success: true,
				user: result.user,
				token: result.token
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

module.exports = router
