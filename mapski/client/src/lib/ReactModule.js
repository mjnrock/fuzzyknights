import { useState, useEffect } from "react";

export function useModule(node) {
	const [ state, setState ] = useState(node.state);

	useEffect(() => {
		const fn = (next) => {
			setState(next);
		};

		node.addEffect(fn);

		return () => {
			node.removeEffect(fn);
		};
	}, [ node ]);

	return {
		state,
		dispatch: node.dispatch.bind(node),
		emit: node.emit.bind(node),
	};
};

export function Subscription({ node, network, children }) {
	const { state, dispatch, emit } = useModule(node);

	const value = {
		network,
		node,
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