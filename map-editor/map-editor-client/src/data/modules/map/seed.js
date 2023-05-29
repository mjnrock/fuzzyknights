import { Map } from "./../../../modules/map/models/Map.js";
import { Tile } from "./../../../modules/map/models/Tile.js";

export function Seed() {
	const rows = 10;
	const columns = 10;
	const tiles = [];

	for(let y = 0; y < rows; y++) {
		tiles.push([]);
		for(let x = 0; x < columns; x++) {
			const data = Math.floor(Math.random() * 3);

			tiles[ y ].push(new Tile({ x, y, data }));
		}
	}

	return new Map({ rows, columns, tiles });
}

export default Seed;