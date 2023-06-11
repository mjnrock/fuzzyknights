export class Tags {
	constructor (...tags) {
		this.tags = new Map();

		this.add(...tags);
	}

	asList() {
		return Array.from(this.tags.keys());
	}
	asEntries() {
		return Array.from(this.tags.entries());
	}
	asValues(argObj = {}, raw = false) {
		let results = [];

		this.tags.forEach((value, key) => {
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

	get(key, ...args) {
		let value = this.tags.get(key);

		if(typeof value === "function") {
			return value(...args);
		} else {
			return value;
		}
	}
	getByIndex(index) {
		let i = 0;
		for(let value of this.tags.values()) {
			if(i === index) {
				return value;
			}

			i++;
		}

		return;
	}

	set(key, value) {
		this.tags.set(key, value);

		return this;
	}
	remove(key) {
		return this.tags.delete(key);
	}
	has(key) {
		return this.tags.has(key);
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
		tags.forEach(tag => this.tags.set(tag, tags));

		return this;
	}
	addEntry(key, value) {
		this.tags.set(key, value);

		return this;
	}
	addObject(object) {
		Object.entries(object).forEach(([ key, value ]) => this.tags.set(key, value));

		return this;
	}

	toObject(argsObj = {}, raw = false) {
		let object = {};

		this.tags.forEach((value, key) => {
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
	toEntries(argsObj = {}, raw = false) {
		return Object.entries(this.toObject(argsObj, raw));
	}
	toTags(argsObj = {}, raw = false) {
		let entries = this.toEntries(argsObj, raw);

		return entries.reduce((tags, [ key, value ]) => {
			if(key === value) {
				tags.push(key);
			} else {
				tags.push([ key, value ]);
			}

			return tags;
		}, []);
	}
};

export default Tags;