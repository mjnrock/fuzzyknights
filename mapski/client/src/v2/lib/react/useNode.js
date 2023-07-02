import { useState, useEffect } from "react";
import Node from "../Node";

export function useNode(node, reducerMap) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		node.dispatch(msg.type, msg.data);
	};

	useEffect(() => {
		const updateListener = (event) => {
			setState(event);
		};

		node.addEventListeners(Node.EventTypes.UPDATE, updateListener);
		return () => {
			node.removeEventListeners(Node.EventTypes.UPDATE, updateListener);
		};
	}, []);

	return {
		state,
		dispatch,
	};
};

export default useNode;