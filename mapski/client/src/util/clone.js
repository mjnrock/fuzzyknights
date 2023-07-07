export function clone(obj) {
	if(obj === null) return null;

	let cloned = Array.isArray(obj) ? [] : {};

	for(let i in obj) {
		if(typeof obj[ i ] === "object" && obj[ i ] !== null) {
			cloned[ i ] = clone(obj[ i ]);
		} else {
			cloned[ i ] = obj[ i ];
		}
	}

	return cloned;
};

export default clone;