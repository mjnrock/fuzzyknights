import { useState, useEffect } from "react";

export function useModule(module) {
	const [ state, setState ] = useState(module.state);

	useEffect(() => {
		const fn = (next) => {
			setState(next);
		};

		module.addEffect(fn);

		return () => {
			module.removeEffect(fn);
		};
	}, [ module ]);

	return {
		state,
		dispatch: module.dispatch.bind(module),
		emit: module.emit.bind(module),
	};
};

export function Subscription({ module, network, children }) {
	const { state, dispatch, emit } = useModule(module);

	const value = {
		network,
		module,
		state,
		dispatch,
		emit,
	};

	return children({ ...value });
};

export default {
	useModule,
	Subscription,
};