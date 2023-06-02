import { Map } from "./../../../modules/map/models/Map.js";
import { Tile } from "./../../../modules/map/models/Tile.js";

import { TextureMap } from "../../stub/EnumTerrainType.js";

export function Seed({ rows = 10, columns = 10, tileData } = {}) {
	const tiles = [];

	for(let y = 0; y < rows; y++) {
		const row = [];
		for(let x = 0; x < columns; x++) {
			const data = tileData !== void 0 ? tileData : ~~(Math.random() * Object.keys(TextureMap).slice(1).length) + 1;	// Remove "null", which is also key 0, so +1 for "key floor".

			row.push(new Tile({ x, y, data }));
		}
		tiles.push(row);
	}

	return new Map({ rows, columns, tiles });
}

export default Seed;