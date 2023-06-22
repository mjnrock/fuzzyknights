import { Tile } from "./Tile";

export const TileMap = {
	Generate(target, { rows, columns, tw, th, tileData } = {}) {
		target.rows = rows || target.rows;
		target.columns = columns || target.columns;
		target.tw = tw || target.tw;
		target.th = th || target.th;

		target.tiles = Array(target.rows).fill().map((_, y) => Array(target.columns).fill().map((_, x) => Tile.New({
			x,
			y,
			data: tileData ? tileData(x, y) : Math.floor(Math.random() * 5),
			// data: tileData ? tileData(x, y) : null,
		}))) || target.tiles;

		return target;
	},
	New({ rows, columns, tw, th, tileData } = {}) {
		return TileMap.Generate({}, { rows, columns, tw, th, tileData });
	},
};

export default TileMap;