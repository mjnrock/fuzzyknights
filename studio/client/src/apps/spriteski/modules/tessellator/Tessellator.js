import Chord from "@lespantsfancy/chord";
import { Base64 } from "../../../../util/Base64.js";

export const Tessellator = {
	Next({ algorithm, ...target } = {}) {
		target.algorithm = algorithm;

		return target;
	},
	New({ algorithm } = {}) {
		return Tessellator.Next(Chord.Node.Identity.New({ algorithm }));
	},

	async tessellate(target, base64, ...args) {
		const { algorithm } = target;
		const canvas = await Base64.Decode(base64);

		return await algorithm(canvas, ...args);
	},
};

export default Tessellator;