import { useState, useEffect } from "react";
import Node from "../Node";

/**
 * This hook will allow you to use a Node as the state of a React component,
 * and will automatically update the component when the Node's state changes.
 * If you need to make a dispatch call to the Node, you can do so by calling
 * the dispatch function returned by this hook.
 * 
 * A reducerMap can be either an array of reducer functions, or an object
 * (where the keys are the message.type trigger, and the values are the reducer).
 */
export function useNode(node, reducerMap) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		let next = node.state;
		if(Array.isArray(reducerMap)) {
			/* If an array, iteratively reduce the state */
			next = reducerMap.reduce((state, reducer) => reducer(state, msg), next);
		} else if(msg.type in reducerMap) {
			/* If an object, use the type as a key to the reducer */
			next = reducerMap[ msg.type ](next, msg.data);
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