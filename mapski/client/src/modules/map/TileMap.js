import { Tile } from "./Tile";

// STUB: This is using example data
import { TerrainDict } from "../../apps/editor/data/TerrainMap";

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

			// STUB: This is using example data
			const index = Math.floor(Math.random() * Object.keys(TerrainDict).length);
			const data = Object.values(TerrainDict)[ index ].type;

			return data;
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