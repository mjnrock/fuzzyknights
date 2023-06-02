import { Tile } from "./Tile.js";

export class Map {
	constructor ({ rows, columns, tiles } = {}) {
		this.rows = rows;			// Number
		this.columns = columns;		// Number
		this.tiles = tiles;			// Array<Tile>
	}

	getTile(x, y) {
		return this.tiles[ y ][ x ];
	}
	setTile(x, y, data) {
		if(x < 0 || x >= this.columns || y < 0 || y >= this.rows) return this;

		const next = this.clone();
		next.tiles[ y ][ x ] = new Tile({ x, y, data });

		return next;
	}
	getTiles(...tileData) {
		return tileData.map(({ x, y }) => this.tiles[ y ][ x ]);
	}
	setTiles(...tileData) {
		const next = this.clone();
		for(let { x, y, data } of tileData) {
			if(x < 0 || x >= this.columns || y < 0 || y >= this.rows) continue;

			next.tiles[ y ][ x ] = new Tile({ x, y, data });
		}

		return next;
	}

	toArray() {
		return [ this.rows, this.columns, this.tiles.map(row => row.map(tile => tile.toArray())) ];
	}
	toObject() {
		return {
			rows: this.rows,
			columns: this.columns,
			tiles: this.tiles.map(row => row.map(tile => tile.toObject())),
		};
	}
	toJson(...args) {
		return JSON.stringify(this.toObject(), ...args);
	}
	clone() {
		return Map.FromObject(this.toObject());
	}

	static FromArray([ rows, columns, tiles ]) {
		return new Map({ rows, columns, tiles: tiles.map(row => row.map(tile => Tile.FromArray(tile))) });
	}
	static FromObject({ rows, columns, tiles }) {
		return new Map({ rows, columns, tiles: tiles.map(row => row.map(tile => Tile.FromObject(tile))) });
	}
};

export default Map;