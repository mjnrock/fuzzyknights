export class Network {
	constructor ({ modules = {} } = {}) {
		this.modules = new Map();

		for(const [ name, module ] of Object.entries(modules)) {
			this.register(name, module);
		}
	}

	register(name, module) {
		this.modules.set(name, module);

		return this;
	}
	unregister(name) {
		this.modules.delete(name);

		return this;
	}

	execute(module, trigger, ...args) {
		if(!this.modules.has(module)) {
			throw new Error(`Module ${ module } does not exist`);
		}

		const instance = this.modules.get(module);

		if(!instance[ trigger ]) {
			throw new Error(`Trigger ${ trigger } does not exist on module ${ module }`);
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
}