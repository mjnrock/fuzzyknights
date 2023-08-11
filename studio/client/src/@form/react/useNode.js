import Chord from "@lespantsfancy/chord";
// import Node from "../Node";
import { useState, useEffect } from "react";

const Node = Chord.Node.Node;

console.log(Node)

export function useNode(node) {
	const [ state, setState ] = useState(node.state);
	const dispatch = (msg) => {
		node.dispatch(msg.type, msg.data);
	};
	const dispatchAsync = async (msg) => {
		await node.dispatchAsync(msg.type, msg.data);
	};
	const emit = (msg) => {
		node.emit(msg.type, msg.data);
	};
	const emitAsync = async (msg) => {
		await node.emitAsync(msg.type, msg.data);
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
		dispatchAsync,
		emit,
		emitAsync,
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