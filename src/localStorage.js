import config from 'config/general';

// https://developer.mozilla.org/en-US/docs/Web/API/Storage

const APPLICATION_IDENTIFY = config.appName || 'MY_APP';
const convertKeyPathToName = (keyPath = []) => {
	try {
		if (!Array.isArray(keyPath)) throw Error('Keypath must be array.', keyPath);
		const hasInvalidSegment = keyPath.some(segment => {
			if (typeof segment !== 'string' && typeof segment !== 'number')
				return true;
			if (typeof segment === 'number' && !Number.isInteger(segment))
				return true;
			return false;
		});
		if (hasInvalidSegment)
			throw Error('Must only contain string or integer in keypath', keyPath);
		keyPath.unshift(APPLICATION_IDENTIFY);
		return keyPath.join('.');
	} catch (err) {
		console.error(err);
		return false;
	}
};

const persistState = {
	// 讀取資料
	loadState(key) {
		try {
			if (!key || (typeof key !== 'string' && !Array.isArray(key))) {
				throw Error('Invalid key in loadState', key);
			}
			const keyName = Array.isArray(key)
				? convertKeyPathToName(key)
				: `${APPLICATION_IDENTIFY}.${key}`;
			const serializedState = localStorage.getItem(keyName);
			if (serializedState === null) return;
			return JSON.parse(serializedState);
		} catch (err) {
			console.error(err);
			return;
		}
	},

	// 儲存資料
	saveState(key, state) {
		try {
			if (!key || (typeof key !== 'string' && !Array.isArray(key)))
				throw Error('Invalid key in saveState', key);
			const keyName = Array.isArray(key)
				? convertKeyPathToName(key)
				: `${APPLICATION_IDENTIFY}.${key}`;
			const serializedState =
				typeof state === 'string' ? state : JSON.stringify(state);
			localStorage.setItem(keyName, serializedState);
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	},

	// 清除指定資料
	deleteState(key) {
		try {
			if (!key || (typeof key !== 'string' && !Array.isArray(key)))
				throw Error('Invalid key in deleteState', key);
			const keyName = Array.isArray(key)
				? convertKeyPathToName(key)
				: `${APPLICATION_IDENTIFY}.${key}`;
			localStorage.removeItem(keyName);
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	},
};

export default persistState;
