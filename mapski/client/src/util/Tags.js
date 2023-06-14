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
		tags.forEach(tag => this.set(tag, tags));

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
		let object = {};

		this.forEach((value, key) => {
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