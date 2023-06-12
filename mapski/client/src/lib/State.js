import { Identity } from "../util/Identity.js";

export class State extends Identity {
	constructor ({ $id, $tags, ...props } = {}) {
		super();

		Object.assign(this, props);
	}

	toObject({ isRecursiveCall = false } = {}) {
		const output = isRecursiveCall ? {} : (typeof super.toObject === "function" ? super.toObject() : {});

		for(const key of Object.keys(this)) {
			const value = this[ key ];

			if(Array.isArray(value)) {
				output[ key ] = value.map(val => {
					if(val && typeof val === "object") {
						if(val.constructor !== Object && typeof val.toObject === "function") {
							return val.toObject({ isRecursiveCall: true });
						} else {
							return this.toObject.call(val, { isRecursiveCall: true });
						}
					} else {
						return val;
					}
				});
			} else if(value && typeof value === "object") {
				if(value.constructor !== Object && typeof val.toObject === "function") {
					output[ key ] = value.toObject({ isRecursiveCall: true });
				} else {
					output[ key ] = this.toObject.call(value, { isRecursiveCall: true });
				}
			} else {
				output[ key ] = value;
			}
		}

		return output;
	}
	toJson(...args) {
		return JSON.stringify(this.toObject(), ...args);
	}

	next(value = {}, withMerge = true) {
		if(withMerge) {
			return new State({ ...this, ...value });
		} else {
			return new State(value);
		}
	}
};

export default State;