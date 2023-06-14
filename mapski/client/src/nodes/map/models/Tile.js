export class Tile {
	constructor ({ x, y, data } = {}) {
		this.x = x;			// Number
		this.y = y;			// Number
		this.data = data;	// Number or Array<Number>
	}

	toArray() {
		return [ this.x, this.y, this.data ];
	}
	toObject() {
		return {
			x: this.x,
			y: this.y,
			data: this.data,
		};
	}
	toJson() {
		return JSON.stringify(this.toObject());
	}

	static FromArray([ x, y, data ]) {
		return new Tile({ x, y, data });
	}
	static FromObject({ x, y, data }) {
		return new Tile({ x, y, data });
	}
};

export default Tile;