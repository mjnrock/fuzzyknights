import { v4 as uuid } from "uuid";
import Node from "../Node";

import Registry from "../Registry";

export class MasterNode extends Node {
	constructor ({ state = {}, events = {}, reducers = {}, effects = {}, registry, id, tags = [], ...rest } = {}) {
		super({ events, effects, registry, id, tags, ...rest });

		//TODO: Determine what to surface from the Registry and make it available here -- make sure to pass the `next` object, as it mutates the argument
		this.state = {
			...state,
		};

		//NOTE: The general idea here is that a MasterNode is like a "node network", and should act as a common interface for all registered nodes

		this.addReducers({
			...reducers,
		});
	}

	send(node, event, ...args) {
	}
	async sendAsync(node, event, ...args) {
	}
	broadcast(event, ...args) {
	}
	async broadcastAsync(event, ...args) {
	}
};

export default MasterNode;