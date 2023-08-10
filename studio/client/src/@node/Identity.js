import { v4 as uuid } from "uuid";
import { Tags } from "./util/Tags.js";

/*
* @Schema = {
* 	[ `$...` ]: <any>,	// Meta data
* 	[ `...` ]: <any>,	// Data
* };
*/

export class IdentityClass {
	constructor ({ id, tags = [], ...rest } = {}) {
		this.$id = id || uuid();
		this.$tags = Tags.ToObject(Tags.From(...tags));

		// Bind `this` to any functions passed in.
		for(const key in rest) {
			if(typeof rest[ key ] === "function") {
				this[ key ] = rest[ key ].bind(this);
			} else {
				this[ key ] = rest[ key ];
			}
		}

		return this;
	}

	copy() {
		return new this.constructor(this);
	}

	toObject() {
		return Identity.toObject(this);
	}
	toString(...args) {
		return Identity.toString(this, ...args);
	}

	toMetaObject() {
		return Identity.toMetaObject(this);
	}
	toMetaString(...args) {
		return Identity.toMetaString(this, ...args);
	}
};

export const Identity = {
	Next({ id, tags = [], ...target } = {}) {
		target.$id = id || uuid();
		target.$tags = Tags.ToObject(Tags.From(...tags));

		return target;
	},
	New({ id, tags = [], ...rest } = {}) {
		return Identity.Next({ id, tags, ...rest });
	},

	/**
	 * Collapses the object into a single object, with the meta data
	 * stored in a $meta object.
	 */
	toObject(target) {
		const obj = {
			$meta: {},
		};

		for(const [ key, value ] of Object.entries(target)) {
			if(key.startsWith("$")) {
				obj.$meta[ key.slice(1) ] = value;
			} else {
				obj[ key ] = value;
			}
		}

		return obj;
	},
	toString(target, ...args) {
		return JSON.stringify(target, ...args);
	},

	/**
	 * Creates an isoldated object with *only* the meta data.
	 */
	toMetaObject(target) {
		const meta = {};

		for(const [ key, value ] of Object.entries(target)) {
			if(key.startsWith("$")) {
				meta[ key ] = value;
			}
		}

		return meta;
	},
	toMetaString(target, ...args) {
		return JSON.stringify(target.toMetaObject(), ...args);
	},
};

export default {
	IdentityClass,
	Identity,
};