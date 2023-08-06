import { v4 as uuid, validate } from "uuid";
import { Identity, IdentityClass } from "./Identity.js";

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

//TODO: The "pathing" paradigm is only partially implemented, mainly in the priority methods; continue implementing it throughout the rest of the library.

const isNamespace = (registry, key) => {
	const entry = registry[ key ];

	if(entry.type === EnumEntryType.ALIAS) {
		return isNamespace(registry, entry.value);
	}

	return entry && entry.type === EnumEntryType.NAMESPACE;
};

const findNamespace = (registry, namespace) => {
	let namespaceEntry = registry[ namespace ];
	return isNamespace(namespaceEntry) ? namespaceEntry.value : null;
};

export const EnumEntryType = {
	ENTRY: 0,
	ALIAS: 1,
	POOL: 2,
	NAMESPACE: 3,
};

export const RegistryEntry = {
	Next({ type, value, id, ...entry } = {}) {
		return {
			...entry,
			type,
			value,
		};
	},
	New({ type, value, id, ...rest } = {}) {
		return RegistryEntry.Next({
			type,
			value,
			...rest,
		});
	},
};

export const Registry = {
	Next(registry, entries = {}) {
		if(Array.isArray(entries)) {
			for(const entry of entries) {
				Registry.register(registry, entry);
			}
		} else if(typeof entries === "object") {
			for(const [ key, value ] of Object.entries(entries)) {
				let id = Registry.register(registry, value);
				Registry.addAlias(registry, id, key);
			}
		}

		return registry;
	},
	New(entries = {}) {
		return Registry.Next(Identity.New(), entries);
	},

	register(registry, entry, isIdentity = false) {
		let id = isIdentity || (typeof entry === "object" && entry.$id) ? entry.$id : uuid();

		if(!id) {
			return false;
		}

		registry[ id ] = RegistryEntry.New({
			type: EnumEntryType.ENTRY,
			value: entry,
		});

		return id;
	},
	unregister(registry, entryOrId) {
		let id = validate(entryOrId) ? entryOrId : entryOrId.$id;

		/* iterate over all keys: if id matches key, delete; if id matches value, delete; if value is an array and id is in array, removeFromPool (if pool is now empty, delete) */
		for(const [ key, value ] of Object.entries(registry)) {
			if(key === id) {
				delete registry[ key ];
			} else if(value.value === id) {
				delete registry[ key ];
			} else if(Array.isArray(value.value) && value.value.includes(id)) {
				Registry.removeFromPool(registry, key, id);
			}

			if(Array.isArray(value.value) && value.value.length === 0) {
				Registry.removePool(registry, key);
			}
		}

		return true;
	},

	addAlias(registry, pathOrId, ...aliases) {
		let id = pathOrId.startsWith("$") ? Resolver.getIdByPath(registry, pathOrId) : pathOrId;
		if(!(id in registry)) {
			return false;
		}


		for(const alias of aliases) {
			registry[ alias ] = RegistryEntry.New({
				type: EnumEntryType.ALIAS,
				value: id,
			});
		}

		return true;
	},
	removeAlias(registry, pathOrId, ...aliases) {
		let id = pathOrId.startsWith("$") ? Resolver.getIdByPath(registry, pathOrId) : pathOrId;
		if(!(id in registry)) {
			return false;
		}

		for(const alias of aliases) {
			delete registry[ alias ];
		}

		return true;
	},

	addPool(registry, pathOrName, ...ids) {
		// Check if the path starts with a $
		if(pathOrName.startsWith("$")) {
			// Extract the root path and alias from the path
			let keys = pathOrName.split(".");
			let alias = keys.pop();

			// Resolve the root path to find the parent registry
			let parentRegistry = Resolver.getValueByPath(registry, keys.join("."));

			// Create a new pool in the parent registry with the given alias and ids
			parentRegistry[ alias ] = RegistryEntry.New({
				type: EnumEntryType.POOL,
				value: ids.map(id => id.startsWith("$") ? Resolver.getIdByPath(registry, id) : id),
			});
		} else {
			// If the path does not start with a $, add the pool to the root registry
			registry[ pathOrName ] = RegistryEntry.New({
				type: EnumEntryType.POOL,
				value: ids,
			});
		}
	},
	removePool(registry, name) {
		delete registry[ name ];
	},
	clearPool(registry, name) {
		registry[ name ].value = [];
	},

	addToPool(registry, pathOrName, ...ids) {
		// Check if the path starts with a $
		if(pathOrName.startsWith("$")) {
			// Extract the root path and alias from the path
			let keys = pathOrName.split(".");
			let alias = keys.pop();

			// Resolve the root path to find the parent registry
			let parentRegistry = Resolver.getValueByPath(registry, keys.join("."));

			// Add the ids to the pool in the parent registry
			if(alias in parentRegistry) {
				parentRegistry[ alias ].value.push(...ids.map(id => id.startsWith("$") ? Resolver.getIdByPath(registry, id) : id));
			}
		} else {
			// If the path does not start with a $, add the ids to the pool in the root registry
			if(pathOrName in registry) {
				registry[ pathOrName ].value.push(...ids);
			}
		}
	},
	removeFromPool(registry, name, ...ids) {
		if(!(name in registry)) {
			return false;
		}

		registry[ name ].value = registry[ name ].value.filter(id => !ids.includes(id));

		return true;
	},

	setNamespace(registry, alias, ...args) {
		const entry = Registry.New(...args);

		if(alias.startsWith("$")) {
			let keys = alias.split(".");
			alias = keys.pop();

			let parentNamespace = Resolver.getValueByPath(registry, keys.join("."));
			if(parentNamespace?.$id in registry) {
				registry = parentNamespace;
			} else {
				return false;
			}
		}

		registry[ entry.$id ] = RegistryEntry.New({
			type: EnumEntryType.NAMESPACE,
			value: entry,
		});

		Registry.addAlias(registry, entry.$id, alias);

		return true;
	},
	removeNamespace(registry, name) {
		delete registry[ name ];
	},
};

export const Reader = {
	getByKey(registry, id) {
		if(!(id in registry)) {
			return;
		}

		return registry[ id ].value;
	},
	getByAlias(registry, alias, resolve = true) {
		if(!(alias in registry)) {
			return;
		}

		if(!resolve) {
			return registry[ alias ].value;
		}

		return registry[ registry[ alias ].value ].value;
	},
	getByPool(registry, name, resolve = true) {
		if(!(name in registry)) {
			return;
		}

		if(resolve) {
			return registry[ name ].value.map(id => registry[ id ].value);
		} else {
			return registry[ name ].value;
		}
	},
};

export const Writer = {
	setById(registry, id, value) {
		if(!(id in registry)) {
			return false;
		}

		registry[ id ].value = value;

		return true;
	},
	setByAlias(registry, alias, value) {
		if(!(alias in registry)) {
			return false;
		}

		registry[ registry[ alias ].value ].value = value;

		return true;
	},
};

export const Resolver = {
	/**
	 * (pathed) Alias to Value
	 */
	getValueByPath(registry, path) {
		// Split the path into keys
		let keys = path.split(".");

		// Start at the root registry ($)
		let rootKey = keys.shift();
		if(rootKey !== "$") {
			throw new Error("Path must start at the root registry ($)");
		}

		// Recursive function for path resolution
		function resolvePath(currentRegistry, remainingKeys) {
			// If there are no keys remaining, we've reached our target.
			if(remainingKeys.length === 0) {
				return currentRegistry;
			}

			let currentKey = remainingKeys.shift();

			// If the current registry does not contain the current key, then the path does not exist.
			if(!(currentKey in currentRegistry)) {
				return;
			}

			// Get the next item in the registry
			let nextItem = currentRegistry[ currentKey ];

			// If the next item is a namespace, update the current registry and get the next key.
			if(nextItem.type === EnumEntryType.NAMESPACE) {
				return resolvePath(nextItem.value, remainingKeys);
			} else if(nextItem.type === EnumEntryType.ALIAS) {
				// If the current key is an alias, get the actual UUID and find that in the registry
				let uuid = nextItem.value;
				if(uuid in currentRegistry) {
					nextItem = currentRegistry[ uuid ];
					if(nextItem.type === EnumEntryType.NAMESPACE) {
						// If the alias pointed to a namespace, continue resolving the path in the namespace
						return resolvePath(nextItem.value, remainingKeys);
					} else {
						// If the alias pointed to something other than a namespace, return its value
						return nextItem.value;
					}
				} else {
					// If the alias' UUID isn't found in the registry, return undefined
					return;
				}
			} else {
				// If the current key points to a value, return its value.
				return nextItem.value;
			}
		}

		// Start the recursive path resolution
		return resolvePath(registry, keys);
	},
	/**
	 * "(pathed) Alias to UUID"
	 */
	getIdByPath(registry, path) {
		// Split the path into keys
		let keys = path.split(".");

		// Start at the root registry ($)
		let rootKey = keys.shift();
		if(rootKey !== "$") {
			throw new Error("Path must start at the root registry ($)");
		}

		// Recursive function for path resolution
		function resolvePath(currentRegistry, remainingKeys) {
			// If there are no keys remaining, we've reached our target.
			if(remainingKeys.length === 0) {
				// Instead of returning the value, return the ID of the final key
				return currentRegistry.$id;
			}

			let currentKey = remainingKeys.shift();

			// If the current registry does not contain the current key, then the path does not exist.
			if(!(currentKey in currentRegistry)) {
				return;
			}

			// Get the next item in the registry
			let nextItem = currentRegistry[ currentKey ];

			// If the next item is a namespace, update the current registry and get the next key.
			if(nextItem.type === EnumEntryType.NAMESPACE) {
				return resolvePath(nextItem.value, remainingKeys);
			} else if(nextItem.type === EnumEntryType.ALIAS) {
				// If the current key is an alias, get the actual UUID and find that in the registry
				let uuid = nextItem.value;
				if(uuid in currentRegistry) {
					nextItem = currentRegistry[ uuid ];
					if(nextItem.type === EnumEntryType.NAMESPACE) {
						// If the alias pointed to a namespace, continue resolving the path in the namespace
						return resolvePath(nextItem.value, remainingKeys);
					} else {
						// If the alias pointed to something other than a namespace, return the ID.
						return uuid;
					}
				} else {
					// If the alias' UUID isn't found in the registry, return undefined
					return;
				}
			} else {
				// If the current key points to a value, return its ID.
				return nextItem.value;
			}
		}

		// Start the recursive path resolution
		return resolvePath(registry, keys);
	},
};

export const Transformer = {
	/**
	 * Turns a Registry into a flattened, hierarchical table structure.
	 */
	flatten(registry, parentId = null, result = []) {
		if(!parentId) {
			parentId = registry.$id;
		}

		Object.entries(registry).forEach(([ id, entry ]) => {
			if(id[ 0 ] === "$") {
				return; // Skip meta data, as we're just flattening records
			}

			const { type, value } = entry;

			switch(type) {
				case EnumEntryType.ENTRY:
					result.push({
						ID: id,
						PID: parentId,
						Type: EnumEntryType.ENTRY,
						Value: value,
					});
					break;
				case EnumEntryType.ALIAS:
					result.push({
						ID: null, // Aliases have a null ID
						PID: value, // ParentId for an alias is the Id of the entry it points to
						Type: EnumEntryType.ALIAS,
						Value: id,
					});
					break;
				case EnumEntryType.POOL:
					result.push({
						ID: id, // Id for a pool is its key
						PID: parentId, // ParentId for a pool is the immediate parent registry to it
						Type: EnumEntryType.POOL,
						Value: value, // Value for a pool is its normal value
					});
					break;
				case EnumEntryType.NAMESPACE:
					result.push({
						ID: id,
						PID: parentId,
						Type: EnumEntryType.NAMESPACE,
						Value: value, // Value for a namespace is its normal value
					});
					Transformer.flatten(value, id, result); // Recurse into namespace
					break;
				default:
					throw new Error("Unknown entry type: " + type);
			}
		});

		return result;
	}
};

export class RegistryClass extends IdentityClass {
	static New = Registry.New;
	static Next = Registry.Next;

	static Reader = Reader;
	static Writer = Writer;
	static Resolver = Resolver;
	static Transformer = Transformer;

	constructor ({ entries, ...args } = {}) {
		super({ ...args });

		this.state = Registry.New(entries);

		return new Proxy(this, {
			get(target, key) {
				if(key in target) {
					return target[ key ];
				}

				if(key in target.state) {
					const entry = target.state[ key ];

					if(entry.type === EnumEntryType.ALIAS) {
						return target.state[ entry.value ].value;
					} else if(entry.type === EnumEntryType.POOL) {
						return entry.value.map(id => target.state[ id ].value);
					} else {
						return entry.value;
					}
				}

				return;
			},
		});
	}

	[ Symbol.iterator ]() {
		const entries = [];

		for(const key in this.state) {
			const entry = this.state[ key ];

			if(entry.type === EnumEntryType.ENTRY) {
				entries.push(entry.value);
			}
		}

		return entries[ Symbol.iterator ]();
	}
};

for(const key in Reader) {
	RegistryClass.prototype[ key ] = function (...args) {
		return Reader[ key ](this.state, ...args);
	}
}
for(const key in Writer) {
	RegistryClass.prototype[ key ] = function (...args) {
		return Writer[ key ](this.state, ...args);
	}
}
for(const key in Registry) {
	if(key === "New" || key === "Next") {
		continue;
	}

	RegistryClass.prototype[ key ] = function (...args) {
		return Registry[ key ](this.state, ...args);
	};
}

export default {
	EnumEntryType,
	RegistryEntry,
	RegistryClass,
	Registry,
	Reader,
	Writer,

	Resolver,
	Transformer,
};