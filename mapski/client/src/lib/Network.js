import { v4 as uuid } from "uuid";

export class Network {
	static Registry = new Map();

	constructor ({ nodes = {}, id, $self = {} } = {}) {
		this.id = id || uuid();
		this.nodes = new Map();

		for(const [ name, node ] of Object.entries(nodes)) {
			this.register(name, node);
		}

		for(const [ key, value ] of Object.entries($self)) {
			this[ key ] = value;

			if(typeof value === "function") {
				this[ key ] = this[ key ].bind(this);
			}
		}

		Network.Registry.set(this.id, this);
	}

	deconstructor() {
		Network.Registry.delete(this.id);
	}

	register(name, node) {
		this.nodes.set(name, node);

		node.network = this;

		return this;
	}
	unregister(name) {
		const node = this.nodes.get(name);

		this.nodes.delete(name);

		node.network = null;

		return this;
	}

	execute(name, trigger, ...args) {
		if(!this.nodes.has(name)) {
			throw new Error(`Node ${ name } does not exist`);
		}

		const instance = this.nodes.get(name);

		if(!instance[ trigger ]) {
			throw new Error(`Trigger ${ trigger } does not exist on node ${ name }`);
		}

		if(trigger === "state") {
			const keys = Array.isArray(args[ 0 ]) ? args[ 0 ] : args[ 0 ].split(".");
			let item = instance.state;

			for(let i = 0; i < keys.length; i++) {
				item = item[ keys[ i ] ];
			}

			return item;
		} else {
			return instance[ trigger ](...args);
		}
	}

	query(name, ...args) {
		if(!this.nodes.has(name)) {
			throw new Error(`Node ${ name } does not exist`);
		}

		const instance = this.nodes.get(name);

		if(!args.length) return instance.state;

		const keys = Array.isArray(args[ 0 ]) ? args[ 0 ] : args[ 0 ].split(".");
		let item = instance.state;

		for(let i = 0; i < keys.length; i++) {
			item = item[ keys[ i ] ];
		}

		return item;
	}

	dispatch(name, ...args) {
		if(!this.nodes.has(name)) {
			throw new Error(`Node ${ name } does not exist`);
		}

		const instance = this.nodes.get(name);

		instance.dispatch(...args);

		return this;
	}

	/**
	 * If the primary purpose of the Network's instantiation is functionally to allow
	 * a "multi-node" context, then this method is a convenience for creating a
	 * Network instance, given a registry of (instantiated) Modules.  It will return
	 * an object with the original registry, as well as the Network instance, if needed.
	 */
	static CreateSimple(nodes = {}) {
		return {
			registry: nodes,
			network: new Network({ nodes }),
		};
	}
};

export default Network;