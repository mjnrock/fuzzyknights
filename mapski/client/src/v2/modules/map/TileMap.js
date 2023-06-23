import { Tile } from "./Tile";

export const TileMap = {
	Next({ rows, columns, tw, th, tiles, tileData, ...target } = {}) {
		target.rows = rows;
		target.columns = columns;
		target.tw = tw;
		target.th = th;

		tileData = tileData !== void 0 ? tileData : function (x, y) {
			if(tiles && tiles[ y ] && tiles[ y ][ x ]) {
				return tiles[ y ][ x ].data;
			}

			return Math.floor(Math.random() * 5);
		};

		target.tiles = Array(rows).fill().map((_, y) => Array(columns).fill().map((_, x) => Tile.New({
			x,
			y,
			data: typeof tileData === "function" ? tileData(x, y) : tileData,
		})));

		return target;
	},
	New({ rows, columns, tw, th, tileData } = {}) {
		return TileMap.Next({ rows, columns, tw, th, tileData });
	},
};

export default TileMap;