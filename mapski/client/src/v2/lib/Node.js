import { IdentityClass } from "./Identity";

export class Node extends IdentityClass {
	static MergeReducer = (current, next) => {
		return {
			...current,
			...next,
		};
	};
	static UpdateReducer = (current, next) => next;
	static LogEffect = (self, state) => console.warn(`[@${ self.$id }]:`, state);

	static EventTypes = {
		PRE: "pre",
		INIT: "init",
		POST: "post",
		UPDATE: "update",
	};

	constructor ({ state = {}, events = {}, reducers = {}, effects = [], registry, id, tags = [], ...rest } = {}) {
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

	dispatch(action, ...args) {
		let previous = { ...this.state };
		let state = this.state;

		if(this.events.reducers[ action ]) {
			state = this.events.reducers[ action ].call(this, state, ...args);
		}
		
		this.state = { ...state };
		this.emit(Node.EventTypes.UPDATE, state, previous, this);

		for(const effect of this.events.effects) {
			effect.call(this, action, state, ...args);
		}

		return state;
	}
	async dispatchAsync(action, ...args) {
		let previous = { ...this.state };
		let state = this.state;

		if(this.events.reducers[ action ]) {
			state = await this.events.reducers[ action ].call(this, state, ...args);
		}

		this.state = { ...state };
		this.emit(Node.EventTypes.UPDATE, state, previous, this);

		for(const effect of this.events.effects) {
			effect.call(this, action, state, ...args);
		}

		return state;
	}

	addReducer(action, reducer) {
		this.events.reducers[ action ] = reducer;

		return this;
	}
	removeReducer(action) {
		delete this.events.reducers[ action ];

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

	static Create({ state = {}, events = {}, reducers = {}, effects = [], registry, id, tags = [], ...rest } = {}) {
		return new Node({
			state,
			events,
			reducers,
			effects,
			registry,
			id,
			tags,
			...rest,
		});
	}
	static CreateMany(stateObject = {}) {
		const obj = {};
		for(const [ key, state ] of Object.entries(stateObject)) {
			obj[ key ] = Node.Create(state);
		}

		return obj;
	}

	static CreateSimple(state = {}) {
		return new Node({
			state,
			reducers: { 'default': Node.MergeReducer },

			// STUB: Remove this
			// effects: [ Node.LogEffect ],
		});
	}
	static CreateManySimple(stateObject = {}) {
		const obj = {};
		for(const [ key, state ] of Object.entries(stateObject)) {
			obj[ key ] = Node.CreateSimple(state);
		}

		return obj;
	}
};

export default Node;