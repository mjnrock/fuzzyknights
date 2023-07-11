/*
 * @Schema = {
 *  x: <Number>,
 *  y: <Number>,
 *  data: <any>,
 *  render: <Color|Canvas>,
 * }
 */

export const Tile = {
	Next({ x, y, data, ...target } = {}) {
		target.x = x;
		target.y = y;
		target.data = data;

		return target;
	},
	New({ x, y, data } = {}) {
		return Tile.Next({ x, y, data });
	},

	toArray(target) {
		return [ target.x, target.y, target.data ];
	},
	toObject(target) {
		return {
			x: target.x,
			y: target.y,
			data: target.data,
		};
	},
	toJson(target, ...args) {
		return JSON.stringify(Tile.toObject(target), ...args);
	},

	FromArray([ x, y, data ]) {
		return Tile.New({ x, y, data });
	},
	FromObject({ x, y, data }) {
		return Tile.New({ x, y, data });
	},
};

export default Tile;