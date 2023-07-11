export function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item) && item !== null;
}

export function isClassInstance(item) {
	if(item === null) return false;
	const isObjectLiteral = Object.getPrototypeOf(item) === Object.prototype;
	return isObject(item) && !isObjectLiteral;
}

export function isArray(item) {
	return Array.isArray(item);
}

export function toObject(pojo, parentObjects = []) {
	if(isClassInstance(pojo)) {
		return Object.assign(Object.create(Object.getPrototypeOf(pojo)), pojo);
	}

	if(parentObjects.includes(pojo)) {
		throw new Error("Circular reference detected");
	}
	parentObjects.push(pojo);

	let newObj;

	if(isArray(pojo)) {
		newObj = [];
		for(let i = 0; i < pojo.length; i++) {
			let value = pojo[ i ];
			if(isClassInstance(value) || typeof value !== "object" || value === null) {
				newObj[ i ] = value;
			} else {
				newObj[ i ] = toObject(value, parentObjects.slice());
			}
		}
	} else {
		newObj = {};
		for(let key in pojo) {
			if(pojo.hasOwnProperty(key)) {
				let value = pojo[ key ];
				if(isClassInstance(value) || typeof value !== "object" || value === null) {
					newObj[ key ] = value;
				} else {
					newObj[ key ] = toObject(value, parentObjects.slice());
				}
			}
		}
	}

	return newObj;
}

export function mergeObject(pojoToObject, extraProps = {}) {
	const pojo = toObject(pojoToObject);
	const extraPropsPojo = toObject(extraProps);

	return Object.assign(pojo, extraPropsPojo);
};

export default {
	isObject,
	isClassInstance,
	isArray,
	toObject,
	mergeObject,
};  