import { Map } from "./../../../modules/map/models/Map.js";
import { Tile } from "./../../../modules/map/models/Tile.js";

import { TextureMap } from "../../stub/EnumTerrainType.js";

export function Seed({ tileData } = {}) {
	const rows = 10;
	const columns = 10;
	const tiles = [];

	for(let y = 0; y < rows; y++) {
		tiles.push([]);
		for(let x = 0; x < columns; x++) {
			const data = tileData != null ? tileData : Math.floor(Math.random() * Object.keys(TextureMap).length);

			tiles[ y ].push(new Tile({ x, y, data }));
		}
	}

	return new Map({ rows, columns, tiles });
}

export default Seed;