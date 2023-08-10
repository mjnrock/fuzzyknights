import Node from "./Node";

/**
 * A Message is a simple wrapper for data that is intended to be sent over an
 * internal network (e.g. a MasterNode)
 */
const Message = {
	Create: ({ type, data, ...rest } = {}) => ({
		id: uuid(),
		type,
		data,
		timestamp: Date.now(),
		...rest,
	}),
	Generate: ({ type, data } = {}) => Message.Create({ type, data }),
};

/**
 * A meta-wrapper intended primarily for external communicaiton (e.g. websockets),
 * but broadly should be any inter-MasterNode communication.
 */
const Envelope = {
	Create: ({ type, message, ...rest } = {}) => ({
		id: uuid(),
		type,
		message,
		timestamp: Date.now(),
		...rest,
	}),
	Generate: ({ type, message } = {}) => Envelope.Create({ type, message }),
};

/**
 * The idea of a Network is that it is a collection of MasterNodes that can communicate with each other.
 * The concept is intended to be encompassing of both internal and external communication.  For internal
 * communication, Messages should be used; for external communication, wrap the Message in an Envelope
 * to add additional information.
 */
export class Network extends Node {
	constructor ({ state = {}, events = {}, reducers = {}, effects = {}, registry, id, tags = [], ...rest } = {}) {
		super({ events, effects, registry, id, tags, ...rest });

		this.state = {
			...state,
		};

		this.addReducers({
			...reducers,
		});
	}
};

export default Network;