/*
 * @Schema = {
 *  type: <Number>,
 *  cost: <Number>,
 *  mask: <any>,
 *  render: <Color|Canvas>,
 * }
 */

export const Terrain = {
	Next({ type, cost, mask, texture, ...target } = {}) {
		target.type = type;
		target.cost = cost;
		target.mask = mask;
		target.texture = texture;

		return target;
	},
	New({ type, cost, mask, texture } = {}) {
		return Terrain.Next({ type, cost, mask, texture });
	},

	toArray(target) {
		return [ target.type, target.cost, target.mask, target.texture ];
	},
	toObject(target) {
		return {
			type: target.type,
			cost: target.cost,
			mask: target.mask,
			texture: target.texture,
		};
	},
	toJson(target, ...args) {
		return JSON.stringify(Terrain.toObject(target), ...args);
	},

	FromArray([ type, cost, mask, texture ]) {
		return Terrain.New({ type, cost, mask, texture });
	},
	FromObject({ type, cost, mask, texture }) {
		return Terrain.New({ type, cost, mask, texture });
	},
};

export default Terrain;