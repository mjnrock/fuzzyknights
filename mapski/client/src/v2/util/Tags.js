/**
 * The general idea of a "Tag" is a unique term, with optional properties.  As
 * such, a "tag" can is just a string, or it can be a string with property values.
 * 
 * The apparent redundancy of this class is to allow for a more intuitive API,
 * by mapping the methods to the data structure that the represent.  Because this
 * is a Map, "entries" represent exactly that, and "values" represent the properties
 * of the tags (or the tag itself if it is non-descriptive).
 */
export class Tags extends Map {
	constructor (...tags) {
		super();

		this.add(...tags);
	}

	asList() {
		return Array.from(this.keys());
	}
	asEntries() {
		return Array.from(this.entries());
	}
	asValues(argObj = {}, raw = false) {
		let results = [];

		this.forEach((value, key) => {
			if(typeof value === "function" && !raw) {
				if(key in argObj) {
					results.push(value(argObj[ key ]));
				} else {
					results.push(value());
				}
			} else {
				results.push(value);
			}
		});

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