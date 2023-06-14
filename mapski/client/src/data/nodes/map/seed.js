import { Map } from "../../../nodes/map/models/Map.js";
import { Tile } from "../../../nodes/map/models/Tile.js";

import { TerrainMap } from "../../stub/TerrainMap.js";

export function Seed({ rows = 10, columns = 10, tileData, tw, th, tiles, ...rest } = {}, excludeTiles = false) {
	const nextTiles = [];
	const terrainMapKeys = Object.keys(TerrainMap);

	for(let y = 0; y < rows; y++) {
		const row = [];
		for(let x = 0; x < columns; x++) {
			if(!excludeTiles && tiles !== void 0 && tiles[ y ] !== void 0 && tiles[ y ][ x ] !== void 0) {
				row.push(tiles[ y ][ x ]);
				continue;
			}

			let data;
			if(tileData) {
				data = tileData;
			} else {
				let index = ~~(Math.random() * terrainMapKeys.length);
				data = terrainMapKeys[ index ];
			}

			row.push(new Tile({ x, y, data }));
		}
		nextTiles.push(row);
	}

	return new Map({
		rows,
		columns,
		tw,
		th,
		tiles: nextTiles,
		...rest,
	});
}

export default Seed;