import { v4 as uuid } from "uuid";
import { Tags } from "../util/Tags";

/*
* @Schema = {
* 	[ `$...` ]: <any>,	// Meta data
* 	[ `...` ]: <any>,	// Data
* };
*/

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

export default Identity;