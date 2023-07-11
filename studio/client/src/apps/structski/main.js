import { Node } from "../../lib/Node";
import { Registry } from "../../lib/Registry";

export const Reducers = {
	registry: {
		register(state, value) {
			const next = {
				...state,
			};

			Registry.register(next, value);

			return next;
		},
		unregister(state, id) {
			const next = {
				...state,
			};

			Registry.unregister(next, id);

			return next;
		},
		addAlias(state, id, alias) {
			const next = {
				...state,
			};

			Registry.addAlias(next, id, alias);

			return next;
		},
		removeAlias(state, id, alias) {
			const next = {
				...state,
			};

			Registry.removeAlias(next, id, alias);

			return next;
		},
		addPool(state, name, ...ids) {
			const next = {
				...state,
			};

			Registry.addPool(next, name, ...ids);

			return next;
		},
		removePool(state, name) {
			const next = {
				...state,
			};

			Registry.removePool(next, name);

			return next;
		},
		clearPool(state, name) {
			const next = {
				...state,
			};

			Registry.clearPool(next, name);

			return next;
		},
		addToPool(state, name, ...ids) {
			const next = {
				...state,
			};

			Registry.addToPool(next, name, ...ids);

			return next;
		},
		removeFromPool(state, name, ...ids) {
			const next = {
				...state,
			};

			Registry.removeFromPool(next, name, ...ids);

			return next;
		},
	},
};

export const State = Node.CreateMany({
	registry: {
		state: Registry.New(),
		reducers: Reducers.registry,
	}
});

export const IMM = (module, message, ...args) => {
	const node = State[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};
export const IMS = (module) => {
	const node = State[ module ];
	if(node) {
		return node.state;
	}
};