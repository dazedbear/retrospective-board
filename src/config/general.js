// development production
const stage = process.env.NODE_ENV;
export const hostMap = {
	site: {
		development: 'local.retro.einfachstudio.com:3000',
		production: 'retro.einfachstudio.com',
	},
	api: {
		development: 'local.retro.einfachstudio.com:3000', // proxy or mock
		production: 'api.einfachstudio.com',
	},
};

let generalConfig = {
	appName: 'RSB',
	siteUrl: `//${hostMap.site[stage]}`,
	api: `//${hostMap.api[stage]}`,
	pusher: {
		appId: '658870',
		key: '90c95ca8247ef500bad5',
		cluster: 'ap1',
	},
};

export default generalConfig;
