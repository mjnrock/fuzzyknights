/*
 * @Schema = {
 *  x: <Number>,
 *  y: <Number>,
 *  data: <any>,
 *  render: <Color|Canvas>,
 * }
 */

export const Tile = (self = {}) => ({
	Create({ x, y, data } = {}) {
		self.x = x;
		self.y = y;
		self.data = data;

		return self;
	},

	toArray() {
		return [ self.x, self.y, self.data ];
	},
	toObject() {
		return {
			x: self.x,
			y: self.y,
			data: self.data,
		};
	},
	toJson(...args) {
		return JSON.stringify(Tile(self).toObject(), ...args);
	},

	FromArray([ x, y, data ]) {
		return Tile.Create({ x, y, data });
	},
	FromObject({ x, y, data }) {
		return Tile.Create({ x, y, data });
	},
});

export default Tile;