const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const yn = require('yn');
// const { warnTemplate } = require('./router/util');

global.initial = false;

/**
 * API 檢查登入 & 服務啟用
 */
const authenticationFilter = (req, res, next) => {
	// TODO:
	return next();
};

/**
 * 開發測試用的 Express API server
 * @param {*} app
 */
const server = app => {
	// default middleware
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(cookieParser());
	app.use(authenticationFilter);

	// routers
	return app;
};

module.exports = server;
