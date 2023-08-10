import { Identity, IdentityClass } from "./Identity.js";
import { Node } from "./Node.js";
import Registry from "./Registry.js";

import { useNode, useNodeEvent } from "./react/useNode.js";

import { clone, analyze } from "./util/clone.js";
import { isObject, isClassInstance, isArray, toObject, mergeObject } from "./util/copy.js";
import { Tags } from "./util/Tags.js";
import { Serialize } from "./util/Serialize.js";

export default {
	Identity,
	IdentityClass,
	Node,
	Registry,

	React: {
		useNode,
		useNodeEvent,
	},

	Util: {
		Tags,
		Serialize,
		clone,
		analyze,
		isObject,
		isClassInstance,
		isArray,
		toObject,
		mergeObject,
	},
};