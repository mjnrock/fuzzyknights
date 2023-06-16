import { v4 as uuid } from "uuid";
import { Tags } from "../util/Tags";

// @Schema = {
// 	[ `$...` ]: <any>,	// Meta data
// 	[ `...` ]: <any>,	// Data
// };

export const Identity = (target = {}) => ({
	Create({ id, tags = [], ...rest } = {}) {
		target.$id = id || uuid();
		target.$tags = Tags.ToObject(Tags.From(...tags));

		Object.assign(target, rest);

		return target;
	},

	/**
	 * Collapses the object into a single object, with the meta data
	 * stored in a $meta object.
	 */
	toObject() {
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
	toString(...args) {
		return JSON.stringify(target, ...args);
	},

	/**
	 * Creates an isoldated object with *only* the meta data.
	 */
	toMetaObject() {
		const meta = {};

		for(const [ key, value ] of Object.entries(target)) {
			if(key.startsWith("$")) {
				meta[ key ] = value;
			}
		}

		return meta;
	},
	toMetaString(...args) {
		return JSON.stringify(target.toMetaObject(), ...args);
	},
});

export default Identity;