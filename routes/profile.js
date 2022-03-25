var express = require('express')
var router  = express.Router()
var multer  = require('multer')
var shortid = require('shortid')

var profileServices = require('../services/profileServices')
var utils           = require('../services/utils')
const path          = require('path')

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

router.get('/', utils.authentication(), (req, res, next) => {
	profileServices.getProfile(req.user._id)
		.then(user => {
			res.status(200).send({
				success: true,
				user
			})
		})
		.catch(err => {
			res.status(err.eCode).send({
				success: false,
				error: err.eText
			})
		})
})

router.post('/edit', utils.authentication(), uploadAvatar, (req, res, next) => {
	let avatar = req.files && req.files['avatar'] ? req.files['avatar'][0].filename : null
	
	profileServices.editProfile({
		user: req.user,
		username: req.body.username,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		avatar,
		name: req.body.name,
		nickname: req.body.nickname,
		email: req.body.email,
		capital: req.body.capital,
		divisa: req.body.divisa,
		preferedCrypto: req.body.preferedCrypto,
	})
		.then(result => {
			res.status(200).send({
				success: true,
				user: result.user
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
