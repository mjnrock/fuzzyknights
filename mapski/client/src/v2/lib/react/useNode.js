import { useState, useEffect } from "react";
import Node from "../Node";

export function useNode(node, reducers) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		let next = state;
		if(Array.isArray(reducers)) {
			/* If an array, iteratively reduce the state */
			next = reducers.reduce((state, reducer) => reducer(state, msg), state);
		} else if(msg.type in reducers) {
			/* If an object, use the type as a key to the reducer */
			next = reducers[ msg.type ](state, msg.data);
		}

		if(next !== state) {
			node.dispatch(next);
		}
	};

	useEffect(() => {
		node.addEventListeners(Node.EventTypes.UPDATE, setState);
		return () => {
			node.removeEventListeners(Node.EventTypes.UPDATE, setState);
		};
	}, []);

	return {
		state,
		dispatch,
	};
};

export default useNode;