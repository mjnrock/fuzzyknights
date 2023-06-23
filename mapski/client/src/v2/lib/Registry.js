import { v4 as uuid, validate } from "uuid";
import Identity from "./Identity";

/*
 * @Schema = {
* 	[ <UUID> ]: <RegistryEntry>({
* 		type: EnumEntryType.VALUE,
* 		value: <any>
* 	}),
* 	[ Alias<string> ]: <RegistryEntry>({
* 		type: EnumEntryType.ALIAS,
* 		value: <UUID>
* 	}),
* 	[ Pool<string> ]: <RegistryEntry>({
* 		type: EnumEntryType.POOL,
* 		value: <UUID[]>
* 	}),
*	...
* };
*/

export const EnumEntryType = {
	ENTRY: 0,
	ALIAS: 1,
	POOL: 2,
};

export const RegistryEntry ={
	Next({ type, value, ...target } = {}) {
		return {
			...target,
			type,
			value,
		};
	},
	New({ type, value, ...rest } = {}) {
		return RegistryEntry.Next({
			type,
			value,
			...rest,
		});
	},
};

export const Registry = {
	Next(target, entries = {}) {
		if(Array.isArray(entries)) {
			for(const entry of entries) {
				Registry.register(target, entry);
			}
		} else if(typeof entries === "object") {
			for(const [ key, value ] of Object.entries(entries)) {
				let id = Registry.register(target, value);
				Registry.addAlias(target, id, key);
			}
		}

		return target;
	},
	New(entries = {}) {
		return Registry.Next(Identity.New(), entries);
	},
	register(target, entry, isIdentity = false) {
		let id = isIdentity || (typeof entry === "object" && entry.$id) ? entry.$id : uuid();

		if(!id) {
			return false;
		}

		target[ id ] = RegistryEntry.New({
			type: EnumEntryType.ENTRY,
			value: entry,
		});

		return id;
	},
	unregister(target, entryOrId) {
		let id = validate(entryOrId) ? entryOrId : entryOrId.$id;

		/* iterate over all keys: if id matches key, delete; if id matches value, delete; if value is an array and id is in array, removeFromPool (if pool is now empty, delete) */
		for(const [ key, value ] of Object.entries(target)) {
			if(key === id) {
				delete target[ key ];
			} else if(value.value === id) {
				delete target[ key ];
			} else if(Array.isArray(value.value) && value.value.includes(id)) {
				Registry.removeFromPool(target, key, id);
			}

			if(Array.isArray(value.value) && value.value.length === 0) {
				Registry.removePool(target, key);
			}
		}

		return true;
	},

	addAlias(target, id, ...aliases) {
		if(!(id in target)) {
			return false;
		}


		for(const alias of aliases) {
			target[ alias ] = RegistryEntry.New({
				type: EnumEntryType.ALIAS,
				value: id,
			});
		}

		return true;
	},
	removeAlias(target, id, ...aliases) {
		if(!(id in target)) {
			return false;
		}

		for(const alias of aliases) {
			delete target[ alias ];
		}

		return true;
	},

	addPool(target, name, ...ids) {
		target[ name ] = RegistryEntry.New({
			type: EnumEntryType.POOL,
			value: ids,
		});
	},
	removePool(target, name) {
		delete target[ name ];
	},
	clearPool(target, name) {
		target[ name ].value = [];
	},

	addToPool(target, name, ...ids) {
		if(!(name in target)) {
			return false;
		}

		target[ name ].value.push(...ids);

		return true;
	},
	removeFromPool(target, name, ...ids) {
		if(!(name in target)) {
			return false;
		}

		target[ name ].value = target[ name ].value.filter(id => !ids.includes(id));

		return true;
	},
};

export const Query = {
	getById(target, id) {
		if(!(id in target)) {
			return;
		}

		return target[ id ].value;
	},
	getByAlias(target, alias) {
		if(!(alias in target)) {
			return;
		}

		return target[ target[ alias ].value ].value;
	},
	getByPool(target, name, resolve = true) {
		if(!(name in target)) {
			return;
		}
		
		if(resolve) {
			return target[ name ].value.map(id => target[ id ].value);
		} else {
			return target[ name ].value;
		}
	},
};

export const Write = {
	setById(target, id, value) {
		if(!(id in target)) {
			return false;
		}

		target[ id ].value = value;

		return true;
	},
	setByAlias(target, alias, value) {
		if(!(alias in target)) {
			return false;
		}

		target[ target[ alias ].value ].value = value;

		return true;
	},
};

export default Registry;