export class Network {
	constructor ({ modules = {} } = {}) {
		this.modules = new Map();

		for(const [ name, module ] of Object.entries(modules)) {
			this.register(name, module);
		}
	}

	register(name, module) {
		this.modules.set(name, module);

		module.network = this;

		return this;
	}
	unregister(name) {
		this.modules.delete(name);

		module.network = null;

		return this;
	}

	execute(name, trigger, ...args) {
		if(!this.modules.has(name)) {
			throw new Error(`Module ${ name } does not exist`);
		}

		const instance = this.modules.get(name);

		if(!instance[ trigger ]) {
			throw new Error(`Trigger ${ trigger } does not exist on module ${ name }`);
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
		if(!this.modules.has(name)) {
			throw new Error(`Module ${ name } does not exist`);
		}


		const instance = this.modules.get(name);
		const keys = Array.isArray(args[ 0 ]) ? args[ 0 ] : args[ 0 ].split(".");
		let item = instance.state;

		for(let i = 0; i < keys.length; i++) {
			item = item[ keys[ i ] ];
		}

		return item;
	}

	/**
	 * If the primary purpose of the Network's instantiation is functionally to allow
	 * a "multi-module" context, then this method is a convenience for creating a
	 * Network instance, given a registry of (instantiated) Modules.  It will return
	 * an object with the original registry, as well as the Network instance, if needed.
	 */
	static CreateSimple(modules = {}) {
		return {
			registry: modules,
			network: new Network({ modules }),
		};
	}
};

export default Network;