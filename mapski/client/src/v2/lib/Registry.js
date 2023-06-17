import { v4 as uuid, validate } from "uuid";

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

export const RegistryEntry = (self = {}) => ({
	Create({ type, value, ...rest } = {}) {
		return Object.assign(self, {
			type,
			value,
			...rest,
		});
	},
});

export const Registry = (self = {}) => ({
	Create(entries = {}) {
		if(Array.isArray(entries)) {
			for(const entry of entries) {
				Registry(self).register(entry);
			}
		} else if(typeof entries === "object") {
			for(const [ key, value ] of Object.entries(entries)) {
				let id = Registry(self).register(value);
				Registry(self).addAlias(id, key);
			}
		}

		return self;
	},
	register(entry, isIdentity = false) {
		let id = isIdentity || (typeof entry === "object" && entry.$id) ? entry.$id : uuid();

		if(!id) {
			return false;
		}

		self[ id ] = RegistryEntry().Create({
			type: EnumEntryType.ENTRY,
			value: entry,
		});

		return id;
	},
	unregister(entryOrId) {
		let id = validate(entryOrId) ? entryOrId : entryOrId.$id;

		/* iterate over all keys: if id matches key, delete; if id matches value, delete; if value is an array and id is in array, removeFromPool (if pool is now empty, delete) */
		for(const [ key, value ] of Object.entries(self)) {
			if(key === id) {
				delete self[ key ];
			} else if(value.value === id) {
				delete self[ key ];
			} else if(Array.isArray(value.value) && value.value.includes(id)) {
				Registry(self).removeFromPool(key, id);
			}

			if(Array.isArray(value.value) && value.value.length === 0) {
				Registry(self).removePool(key);
			}
		}

		return true;
	},

	addAlias(id, ...aliases) {
		if(!(id in self)) {
			return false;
		}


		for(const alias of aliases) {
			self[ alias ] = RegistryEntry().Create({
				type: EnumEntryType.ALIAS,
				value: id,
			});
		}

		return true;
	},
	removeAlias(id, ...aliases) {
		if(!(id in self)) {
			return false;
		}

		for(const alias of aliases) {
			delete self[ alias ];
		}

		return true;
	},

	addPool(name, ...ids) {
		self[ name ] = RegistryEntry().Create({
			type: EnumEntryType.POOL,
			value: ids,
		});
	},
	removePool(name) {
		delete self[ name ];
	},
	clearPool(name) {
		self[ name ].value = [];
	},

	addToPool(name, ...ids) {
		if(!(name in self)) {
			return false;
		}

		self[ name ].value.push(...ids);

		return true;
	},
	removeFromPool(name, ...ids) {
		if(!(name in self)) {
			return false;
		}

		self[ name ].value = self[ name ].value.filter(id => !ids.includes(id));

		return true;
	},
});

export const Query = (self = {}) => ({
	getById(id) {
		if(!(id in self)) {
			return;
		}

		return self[ id ].value;
	},
	getByAlias(alias) {
		if(!(alias in self)) {
			return;
		}

		return self[ self[ alias ].value ].value;
	},
	getByPool(name, resolve = true) {
		if(!(name in self)) {
			return;
		}
		
		if(resolve) {
			return self[ name ].value.map(id => self[ id ].value);
		} else {
			return self[ name ].value;
		}
	},
});

export default Registry;