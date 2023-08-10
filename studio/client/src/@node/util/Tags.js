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

export class Evaluator {
	constructor (tags, expression) {
		this.tags = tags;
		this.expression = expression instanceof Expression ? expression : Expression.parse(expression);
	}

	isPojo(obj) {
		if(obj === null || typeof obj !== "object") {
			return false;
		}
		return Object.getPrototypeOf(obj) === Object.prototype;
	}

	isClassInstance(obj) {
		if(typeof obj !== "object") {
			return false;
		}
		return obj.constructor.name !== "Object";
	}

	evaluate() {
		switch(this.expression.operation) {
			/* Comparators */
			case "EQ":
				return this.tags.get(this.expression.tag) === this.expression.value;
			case "LT":
				return this.tags.get(this.expression.tag) < this.expression.value;
			case "LTE":
				return this.tags.get(this.expression.tag) <= this.expression.value;
			case "GT":
				return this.tags.get(this.expression.tag) > this.expression.value;
			case "GTE":
				return this.tags.get(this.expression.tag) >= this.expression.value;
			case "IN":
				return this.tags.get(this.expression.tag).includes(this.expression.value);
			case "REGEX":
				return new RegExp(this.expression.value).test(this.tags.get(this.expression.tag));
			case "FN":
				return this.tags.get(this.expression.tag)(this.expression.value);

			/* Logical */
			case "T":
				return Boolean(this.tags.get(this.expression.tag));
			case "F":
				return !Boolean(this.tags.get(this.expression.tag));
			case "AND":
				return this.expression.tag.every(operand => new Evaluator(this.tags, operand).evaluate());
			case "OR":
				return this.expression.tag.some(operand => new Evaluator(this.tags, operand).evaluate());
			case "NOT":
				return !(new Evaluator(this.tags, this.expression.tag).evaluate());

			/* Type */
			case "IsNumber":
				return typeof this.tags.get(this.expression.tag) === "number";
			case "IsString":
				return typeof this.tags.get(this.expression.tag) === "string";
			case "IsBoolean":
				return typeof this.tags.get(this.expression.tag) === "boolean";
			case "IsSymbol":
				return typeof this.tags.get(this.expression.tag) === "symbol";
			case "IsBigInt":
				return typeof this.tags.get(this.expression.tag) === "bigint";
			case "IsFunction":
				return typeof this.tags.get(this.expression.tag) === "function";
			case "IsObject":
				return typeof this.tags.get(this.expression.tag) === "object";
			case "IsArray":
				return Array.isArray(this.tags.get(this.expression.tag));
			case "IsUndefined":
				return typeof this.tags.get(this.expression.tag) === "undefined";
			case "IsNull":
				return this.tags.get(this.expression.tag) === null;
			case "IsNaN":
				return Number.isNaN(this.tags.get(this.expression.tag));
			case "IsPOJO":
				return this.isPojo(this.tags.get(this.expression.tag));
			case "IsClassInstance":
				return this.isClassInstance(this.tags.get(this.expression.tag));

			default:
				throw new Error("Unsupported operation: " + this.expression.operation);
		}
	}
};

export class Expression {
	constructor (operation, tag, value) {
		this.operation = operation;
		this.tag = tag;
		this.value = value;
	}

	static parse(inputArray) {
		const operation = inputArray[ 0 ];
		const tag = inputArray[ 1 ];

		switch(operation) {
			case "AND":
			case "OR":
				const operands = inputArray[ 1 ].map(Expression.parse);
				return new Expression(operation, operands);
			case "NOT":
				const operand = Expression.parse(inputArray[ 1 ]);
				return new Expression(operation, operand);
			case "EQ":
			case "LT":
			case "LTE":
			case "GT":
			case "GTE":
			case "IN":
			case "REGEX":
			case "FN":
			case "T":
			case "F":
				const value = inputArray[ 2 ];
				return new Expression(operation, tag, value);
			case "IsNumber":
			case "IsString":
			case "IsBoolean":
			case "IsSymbol":
			case "IsBigInt":
			case "IsFunction":
			case "IsObject":
			case "IsArray":
			case "IsUndefined":
			case "IsNull":
			case "IsNaN":
			case "IsPOJO":
			case "IsClassInstance":
				return new Expression(operation, tag);
			default:
				throw new Error(`Unsupported operation: ${ operation }`);
		}
	}
};

export default Tags;