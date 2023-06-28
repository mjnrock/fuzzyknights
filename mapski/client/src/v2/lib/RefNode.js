import { IdentityClass } from "../lib/Identity";
import { Query, Write } from "../lib/Registry";

export class Node extends IdentityClass {
	static EventTypes = {
		PRE: "pre",
		INIT: "init",
		POST: "post",
		UPDATE: "update",
	};

	static New(...args) {
		return new this(...args);
	}

	constructor ({ state = {}, reducers = [], effects = [], events = {}, registry, id, tags = [], ...rest } = {}) {
		super({ id, tags, ...rest });

		this.state = state;
		this.events = {
			reducers,
			effects,

			...events,
		};

		/* The idea here is that the registry is a global object that can be used to
		 * look up other nodes, effects, reducers, etc. This is useful for when you
		 * want to use a node as a reducer, but you don't want to import it into the
		 * file.  Instead, you can just register it with the registry, and then use
		 * the ID of the node as the reducer. */
		this.$registry = registry;
	}

	get $state() {
		if(typeof this.state === "string") {
			return Query.getByKey(this.$registry, this.state);
		}

		return this.state;
	}
	set $state(value) {
		if(typeof this.state === "string") {
			Write.setById(this.$registry, this.state, value);
		} else {
			this.state = value;
		}
	}

	init(...args) {
		this.emit(Node.EventTypes.PRE, ...args);
		this.emit(Node.EventTypes.INIT, ...args);
		this.emit(Node.EventTypes.POST, ...args);

		return this;
	}

	dispatch(...args) {
		let previous = { ...this.$state },
			next = this.$state;

		for(let reducer of this.events.reducers) {
			if(typeof reducer !== "function") {
				reducer = Query.getByKey(this.$registry, reducer);

				if(typeof reducer !== "function") {
					throw new Error(`Reducer "${ reducer }" did not resolve to a function.`);
				}
			}

			next = reducer.call(this, next, previous, ...args);
		}

		console.log(829374982374, next)
		this.$state = { ...next };
		this.emit(Node.EventTypes.UPDATE, next, previous, this);

		for(let effect of this.events.effects) {
			if(typeof effect !== "function") {
				effect = Query.getByKey(this.$registry, effect);

				if(typeof effect !== "function") {
					throw new Error(`Effect "${ effect }" did not resolve to a function.`);
				}
			}

			effect(next, ...args, this);
		}

		return next;
	}
	async dispatchAsync(...args) {
		let previous = { ...this.$state },
			next = this.$state;

		for(let reducer of this.events.reducers) {
			if(typeof reducer !== "function") {
				reducer = Query.getByKey(this.$registry, reducer);

				if(typeof reducer !== "function") {
					throw new Error(`Reducer "${ reducer }" did not resolve to a function.`);
				}
			}

			next = await reducer.call(this, next, previous, ...args);
		}

		this.$state = { ...next };
		this.emit(Node.EventTypes.UPDATE, next, previous, this);

		for(let effect of this.events.effects) {
			if(typeof effect !== "function") {
				effect = Query.getByKey(this.$registry, effect);

				if(typeof effect !== "function") {
					throw new Error(`Effect "${ effect }" did not resolve to a function.`);
				}
			}

			effect(next, ...args, this);
		}

		return next;
	}

	addReducer(...reducers) {
		this.events.reducers.push(...reducers);

		return this;
	}
	removeReducer(...reducers) {
		this.events.reducers = this.events.reducers.filter(reducer => !reducers.includes(reducer));

		return this;
	}

	addEffect(...effects) {
		this.events.effects.push(...effects);

		return this;
	}
	removeEffect(...effects) {
		this.events.effects = this.events.effects.filter(effect => !effects.includes(effect));

		return this;
	}

	emit(event, ...args) {
		if(!this.events[ event ]) {
			return;
		}

		return this.events[ event ].map(listener => {
			if(typeof listener !== "function") {
				listener = Query.getByKey(this.$registry, listener);
			}

			if(typeof listener === "function") {
				return listener(...args);
			} else if(listener instanceof Node && !(event in Node.EventTypes)) {
				// Act like a repeater, but no repeating of critical events
				return listener.emit(event, ...args);
			}
		});
	}
	async emitAsync(event, ...args) {
		if(!this.events[ event ]) {
			return;
		}

		return Promise.all(this.events[ event ].map(listener => {
			if(typeof listener !== "function") {
				listener = Query.getByKey(this.$registry, listener);
			}

			if(typeof listener === "function") {
				return listener(...args);
			} else if(listener instanceof Node && !(event in Node.EventTypes)) {
				// Act like a repeater, but no repeating of critical events
				return listener.emitAsync(event, ...args);
			}
		}));
	}

	addEventListeners(event, ...listeners) {
		if(!this.events[ event ]) {
			this.events[ event ] = [];
		}

		if(typeof event === "object") {
			// "Event object"
			for(const [ e, l ] of Object.entries(event)) {
				this.addEventListeners(e, ...l);
			}
		} else {
			this.events[ event ].push(...listeners);
		}

		return this;
	}
	removeEventListeners(event, ...listeners) {
		if(!this.events[ event ]) {
			return;
		}

		if(typeof event === "object") {
			// "Event object"
			for(const [ e, l ] of Object.entries(event)) {
				this.removeEventListeners(e, ...l);
			}
		} else {
			this.events[ event ] = this.events[ event ].filter(listener => !listeners.includes(listener));
		}

		if(this.events[ event ].length === 0) {
			delete this.events[ event ];
		}

		return this;
	}
};

export default Node;