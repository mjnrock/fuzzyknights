import * as PIXI from "pixi.js";
import Base64 from "../../../../util/Base64";

export const Factories = {
	FromBase64: async (name, base64) => {
		const next = State({ name });

		next.canvas = await Base64.Decode(base64);

		return next;
	},
};

export const State = ({ name, canvas } = {}) => ({
	name,
	canvas,
});

export default {
	State,
	Factories,
};