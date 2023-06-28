import { IdentityClass } from "./Identity";

export class Node extends IdentityClass {
	static EventTypes = {
		PRE: "pre",
		INIT: "init",
		POST: "post",
		UPDATE: "update",
	};

	constructor ({ state = {}, events = {}, reducers = [], effects = [], registry, id, tags = [], ...rest } = {}) {
		super({ id, tags, ...rest });

		this.state = state;
		this.events = {
			reducers,
			effects,

			...events,
		};
	}

	init(...args) {
		this.emit(Node.EventTypes.PRE, ...args);
		this.emit(Node.EventTypes.INIT, ...args);
		this.emit(Node.EventTypes.POST, ...args);

		return this;
	}

	dispatch(...args) {
		let previous = { ...this.state },
			next = this.state;

		for(const reducer of this.events.reducers) {
			next = reducer.call(this, next, ...args);
		}

		this.state = { ...next };
		this.emit(Node.EventTypes.UPDATE, next, previous, this);

		for(const effect of this.events.effects) {
			effect(next, ...args, this);
		}

		return next;
	}
	async dispatchAsync(...args) {
		let previous = { ...this.state },
			next = this.state;

		for(const reducer of this.events.reducers) {
			next = await reducer.call(this, next, previous, ...args);
		}

		this.state = { ...next };
		this.emit(Node.EventTypes.UPDATE, next, previous, this);

		for(const effect of this.events.effects) {
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

		this.events[ event ].forEach(listener => listener(...args));
	}
	async emitAsync(event, ...args) {
		if(!this.events[ event ]) {
			return;
		}

		return Promise.all(this.events[ event ].map(listener => listener(...args)));
	}

	addEventListeners(event, ...listeners) {
		if(!this.events[ event ]) {
			this.events[ event ] = [];
		}

		if(typeof event === "object") {
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