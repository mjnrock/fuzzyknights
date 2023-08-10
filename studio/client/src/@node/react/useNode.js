import { useState, useEffect } from "react";
import Node from "../Node";

export function useNode(node) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		node.dispatch(msg.type, msg.data);
	};

	useEffect(() => {
		const updateListener = (next) => {
			setState(next);
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

export function useNodeEvent(node, event, callback) {
	useEffect(() => {
		node.addEventListeners(event, callback);
		return () => {
			node.removeEventListeners(event, callback);
		};
	}, []);

	return {
		emit: node.emit.bind(node, event),
		emitAsync: node.emitAsync.bind(node, event),
	};
};

export default {
	useNode,
	useNodeEvent,
};