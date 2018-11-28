/**
 * Common Response 規範的格式
 */

const resTemplate = response => ({
	response,
});

const warnTemplate = (desc = 'warning message', code = 0) => ({
	warning: {
		code,
		desc,
	},
});

const errorTemplate = (message = 'error message', exception) => ({
	error: {
		exception,
		message,
	},
});

const uuid = () => {
	let d = Date.now();
	if (
		typeof performance !== 'undefined' &&
		typeof performance.now === 'function'
	) {
		d += performance.now(); //use high-precision timer if available
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
};

module.exports = {
	resTemplate,
	warnTemplate,
	errorTemplate,
	uuid,
};
