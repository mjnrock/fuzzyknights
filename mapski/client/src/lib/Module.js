import { v4 as uuid } from "uuid";

export class Module {
	static EventTypes = {
		PRE_INIT: "preinit",
		INIT: "init",
		POST_INIT: "postinit",
		STATE_CHANGE: "statechange",
	};

	constructor ({ state = {}, events = {}, config = {}, reducers = [], effects = [], listeners = [], network = null, id, $init, $self = {} } = {}) {
		this.id = id || uuid();
		this.network = network;

		this.state = state;
		this.events = {
			reducers: [],
			effects: [],
			listeners: [],

			...events,
		};

		this.config = {
			...config,
		};

		this.addEventListener(listeners);
		this.addReducer(...reducers);
		this.addEffect(...effects);

		if(Array.isArray($init)) {
			this.init(...$init);
		}

		for(const [ key, value ] of Object.entries($self)) {
			this[ key ] = value;

			if(typeof value === "function") {
				this[ key ] = this[ key ].bind(this);
			}
		}
	}

	get $query() {
		return this.network.query.bind(this.network);
	}
	get $execute() {
		return this.network.execute.bind(this.network);
	}
	get $dispatch() {
		return this.network.dispatch.bind(this.network);
	}

	init(...args) {
		this.emit(Module.EventTypes.PRE_INIT, ...args);
		this.emit(Module.EventTypes.INIT, ...args);
		this.emit(Module.EventTypes.POST_INIT, ...args);

		return this;
	}

	dispatch(...args) {
		// let previous = structuredClone(this.state),
		let previous = { ...this.state },
			next = this.state;

		for(const reducer of this.events.reducers) {
			next = reducer(next, ...args, this);
		}

		if(JSON.stringify(previous) !== JSON.stringify(next)) {
			this.emit(Module.EventTypes.STATE_CHANGE, next, previous, this);
		}

		this.state = next;

		// const effectState = typeof next === "object" && "clone" in next ? next.clone() : structuredClone(next);
		const effectState = typeof next === "object" && "clone" in next ? next.clone() : { ...next };

		for(const effect of this.events.effects) {
			effect(effectState, ...args, this);
		}

		return this;
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
		if(!this.events.listeners[ event ]) {
			return;
		}

		this.events.listeners[ event ].forEach(listener => listener(...args));
	}
	addEventListener(event, ...listeners) {
		if(typeof event === "object") {
			// Allow for object syntax (e.g. { event: [ listener1, listener2 ], event2: listener3, ... })
			Object.entries(event).forEach(([ event, listeners ]) => {
				this.addEventListener(event, ...(Array.isArray(listeners) ? listeners : [ listeners ]));
			});

			return this;
		}

		if(!this.events.listeners[ event ]) {
			this.events.listeners[ event ] = [];
		}

		this.events.listeners[ event ].push(...listeners);

		return this;
	}
	removeEventListener(event, ...listeners) {
		if(typeof event === "object") {
			// Allow for object syntax (e.g. { event: [ listener1, listener2 ], event2: listener3, ... })
			Object.entries(event).forEach(([ event, listeners ]) => {
				this.removeEventListener(event, ...(Array.isArray(listeners) ? listeners : [ listeners ]));
			});

			return this;
		}

		if(!this.events.listeners[ event ]) {
			return;
		}

		this.events.listeners[ event ] = this.events.listeners[ event ].filter(listener => !listeners.includes(listener));

		if(this.events.listeners[ event ].length === 0) {
			delete this.events.listeners[ event ];
		}

		return this;
	}
};

export default Module;