/* eslint-disable */
const proxy = require('http-proxy-middleware');
const yn = require('yn');
const server = require('../mockServer/server');
const { hostMap } = require('config/general');

module.exports = function(app) {
	// 載入開發測試用的 mock API routes
	if (yn(process.env.TOGGLE_MOCK_API_SERVER)) {
		typeof server === 'function' && server(app);
	}

	// 載入 local 開發用 proxy HPM
	app.use(
		proxy(['/ajax'], {
			target: `https://${hostMap.api['production']}`,
			logLevel: 'debug',
			changeOrigin: true,
			ws: true,
			onProxyReq: (proxyReq, req, res) => {
				proxyReq.setHeader('Origin', hostMap.site['development']);
			},
		})
	);
};
