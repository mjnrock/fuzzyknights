/**
 * The general idea of a "Tag" is a unique term, with optional properties.  As
 * such, a "tag" can be just a string, or it can be a string with property values.
 * 
 * The apparent redundancy of this class is to allow for a more intuitive API,
 * by mapping the methods to the data structure that they represent.  Because this
 * is a Map, "entries" represent exactly that, and "values" represent the properties
 * of the tags (or the tag itself if it is "non-descriptive").
 * 
 * Importantly, this class allows for dynamic properties, which are properties that
 * are a "retriever" function.  This allows for the properties to be populated
 * from external sources (e.g. API, database, etc.).
 */
export class Tags extends Map {
	constructor (...tags) {
		super();

		this.add(...tags);
	}

	/**
	 * Use this when you want a unique list of tags (names).
	 */
	asList() {
		return Array.from(this.keys());
	}
	/**
	 * Use this when you want a descriptive list of tags (names and values).
	 * NOTE: If you have dynamic properties, this will *return the functions*.
	 * Use the "asValues" method if you want the results of the functions.
	 */
	asEntries() {
		return Array.from(this.entries());
	}
	/**
	 * This is basically "asEntries", but as if the dynamic properties were
	 * to be resolved.  If you have no dynamic properties, this will be the
	 * same as "asEntries", but returning a Promise, instead.
	 */
	async asValues(argObj = {}, raw = false) {
		let results = [];

		for(let [ key, value ] of this.entries()) {
			if(typeof value === "function" && !raw) {
				if(key in argObj) {
					/* If the value is a function and custom arguments have been passed, use them. */
					results.push(await value(argObj[ key ]));
				} else {
					/* If the value is just a function, execute it. */
					results.push(await value());
				}
			} else {
				/* If raw option is set, or the value is not a function, use it. */
				results.push(value);
			}
		}

		return results;
	}

	getByIndex(index) {
		let i = 0;
		for(let value of this.values()) {
			if(i === index) {
				return value;
			}

			i++;
		}

		return;
	}

	add(...inputs) {
		inputs.forEach(input => {
			if(Array.isArray(input)) {
				this.addEntry(...input);
			} else if(typeof input === "object") {
				this.addObject(input);
			} else {
				this.addValue(input);
			}
		});

		return this;
	}
	addValue(...tags) {
		tags.forEach(tag => this.set(tag, tag));

		return this;
	}
	addEntry(key, value) {
		this.set(key, value);

		return this;
	}
	addObject(object) {
		Object.entries(object).forEach(([ key, value ]) => this.set(key, value));

		return this;
	}

	toObject(argsObj = {}, raw = false) {
		return Tags.ToObject(this, argsObj, raw);
	}
	toEntries(argsObj = {}, raw = false) {
		return Tags.ToEntries(this, argsObj, raw);
	}
	toTags(argsObj = {}, raw = false) {
		return Tags.ToTags(this, argsObj, raw);
	}

	static ToObject(target, argsObj = {}, raw = false) {
		let object = {},
			iterator;

		if(target instanceof Map) {
			iterator = target.entries();
		} else if(Array.isArray(target)) {
			iterator = target;
		} else if(typeof target === "object") {
			iterator = Object.entries(target);
		} else {
			return false;
		}

		Array.from(iterator).forEach(([ key, value ]) => {
			if(typeof value === "function" && !raw) {
				if(key in argsObj) {
					object[ key ] = value(argsObj[ key ]);
				} else {
					object[ key ] = value();
				}
			} else {
				object[ key ] = value;
			}
		});

		return object;
	}
	static ToEntries(target, argsObj = {}, raw = false) {
		return Object.entries(Tags.ToObject(target, argsObj, raw));
	}
	static ToTags(target, argsObj = {}, raw = false) {
		let entries = Tags.ToEntries(target, argsObj, raw);

		return entries.reduce((tags, [ key, value ]) => {
			if(key === value) {
				tags.push(key);
			} else {
				tags.push([ key, value ]);
			}

			return tags;
		}, []);
	}

	static FromObject(object) {
		return new Tags().addObject(object);
	}
	static FromEntries(entries) {
		return new Tags().add(...entries);
	}
	static FromTags(tags) {
		return new Tags().add(...tags);
	}

	static From(...inputs) {
		return new Tags(...inputs);
	}
};

export default Tags;