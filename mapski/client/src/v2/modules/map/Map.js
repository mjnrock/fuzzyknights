import { Tile } from "./Tile";

export const Map = (self = {}) => ({
	Create({ rows = 10, columns = 10, tw = 32, th = 32, tileData } = {}) {
		self.rows = rows;
		self.columns = columns;
		self.tw = tw;
		self.th = th;

		self.tiles = Array(rows).fill().map((_, y) => Array(columns).fill().map((_, x) => Tile().Create({
			x,
			y,
			data: tileData ? tileData(x, y) : null,
		})));

		return self;
	},
});

export default Map;