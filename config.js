var dbUser     = ''
var dbPassword = ''
var config     = {}

if (dbUser && dbPassword) {
	config = {
		dbUrl: 'mongodb://' + dbUser + ':' + dbPassword + '@localhost:27017/xcoins'
	}
}
else {
	config = {
		dbUrl: 'mongodb://localhost:27017/xcoins'
	}
}


config.jwtSecretKey = {
	auth: 'testestestestestestestestestestestestest',
	forgetPass: 'testestestestestestestestestestestestest',
	verifyPhone: 'verifyPhoneverifyPhoneverifyPhoneverifyPhone',
	verifyEmail: 'verifyEmailverifyEmailverifyEmailverifyEmailverifyEmail',
	login: 'loginloginloginloginloginloginloginloginloginloginloginlogin',
}

module.exports = config
