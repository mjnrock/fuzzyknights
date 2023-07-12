export const flatten = (obj, prefix = "") => {
	const results = Object.keys(obj).reduce((acc, k) => {
		const pre = prefix.length ? prefix + "." : "";
		if(typeof obj[ k ] === "object" && obj[ k ] !== null) {
			acc.push(...flatten(obj[ k ], pre + k));
		} else {
			acc.push([ pre + k, obj[ k ] ]);
		}
		return acc;
	}, []);

	return results.sort((a, b) => a[ 0 ].localeCompare(b[ 0 ]));
};

export const unflatten = (obj) => {
	const results = {};
	Object.keys(obj).forEach((k) => {
		const parts = k.split(".");
		let cur = results;
		for(let i = 0; i < parts.length - 1; i++) {
			if(!cur[ parts[ i ] ]) {
				cur[ parts[ i ] ] = {};
			}
			cur = cur[ parts[ i ] ];
		}
		cur[ parts[ parts.length - 1 ] ] = obj[ k ];
	});

	return results;
};

export default {
	flatten,
	unflatten,
};