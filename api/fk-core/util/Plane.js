import Functions from "./Functions";

class Plane {
	constructor(width, height, seedFn = null) {
		if(!(~~width > 0 && ~~height > 0)) {
			throw new Error("Planar dimensions must exceed 0-unit length");
		}

		this.Width = ~~width;
		this.Height = ~~height;
		this.Elements = {};

		this.Formulas = {
			Key: (x, y) => `X${ ~~x }Y${ ~~y }`
		}

		for(let x = 0; x < this.Width; x++) {
			for(let y = 0; y < this.Height; y++) {
				if(typeof seedFn === "function") {
					this.Set(x, y, seedFn(x, y));
				} else {
					this.Set(x, y, [x, y]);
				}
			}
		}
	}

	Reset(width, height) {
		if(width > 0 && height > 0) {
			this.Width = ~~width;
			this.Height = ~~height;
		}

		this.Elements = {};

		for(let x = 0; x < this.Width; x++) {
			for(let y = 0; y < this.Height; y++) {
				this.Set(x, y, null);
			}
		}

		return this;
	}

	GetKeyFormula() {
		return this.Formulas.Key;
	}
	SetKeyFormula(fn) {
		this.Formulas.Key = fn;

		return this;
	}
	GenKey(...args) {
		return this.Formulas.Key(...args);
	}

	Get(x, y) {
		return this.Elements[this.GenKey(x, y)];
	}
	Set(x, y, value) {
		this.Elements[this.GenKey(x, y)] = value;

		return this;
	}

	IsEmpty(x, y) {
		let val = this.Get(x, y);

		return val === null || val === void 0;
	}

	SanitizeRanges(x, y) {
		return [
			Functions.Clamp(x, 0, this.Width),
			Functions.Clamp(y, 0, this.Height),
		];
	}
	WrapValue(x, y, value) {
		return {
			X: x,
			Y: y,
			Value: value
		};
	}
	CheckPerformWrap(filter, metaWrap, array, x, y, value, ...args) {				
		if(typeof filter === "function") {
			if(filter(x, y, value, ...args)) {
				if(metaWrap) {
					array.push(this.WrapValue(x, y, value));
				} else {
					array.push(value);
				}
			}
		} else {
			if(metaWrap) {
				array.push(this.WrapValue(x, y, value));
			} else {
				array.push(value);
			}
		}

		return array;
	}

	GetEuclideanDistance(x0, y0, x1, y1) {
		return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
	}
	GetManhattanDistance(x0, y0, x1, y1) {
		return Math.abs(x0 - x1) + Math.abs(y0 - y1);
	}

	GetSection(x0, y0, x1, y1, metaWrap = true, filter = null) {		
		let cells = [];

		for(let i = x0; i < x1; i++) {
			for(let j = y0; j < y1; j++) {
				this.CheckPerformWrap(filter, metaWrap, cells, i, j, this.Get(i, j), [x0, y0, x1, y1], this);
			}
		}

		return cells;
	}
	GetRow(y, metaWrap = true, filter = null) {
		let cells = [];
		for(let i = 0; i < this.Width; i++) {
			this.CheckPerformWrap(filter, metaWrap, cells, i, y, this.Get(i, y), [y], this);
		}

		return cells;
	}
	GetColumn(x, metaWrap = true, filter = null) {
		let cells = [];
		for(let j = 0; j < this.Height; j++) {
			this.CheckPerformWrap(filter, metaWrap, cells, x, j, this.Get(x, j), [x], this);
		}

		return cells;
	}

	/**
	 * @logic IF (typeof $filter === "function"), THEN @filter(i, j, value, [$x, $y, $r], this) ? neighbors.push() : NOOP
	 * @return [ { X: i, Y: j, Value: value }... ]
	 */
	GetNeighbors(x, y, r, metaWrap = true, filter = null) {
		let [ x0, y0 ] = this.SanitizeRanges(x - r, y - r),
			[ x1, y1 ] = this.SanitizeRanges(x + r, y + r),
			cells = [];

		for(let i = x0; i <= x1; i++) {
			for(let j = y0; j <= y1; j++) {
				this.CheckPerformWrap(filter, metaWrap, cells, i, j, this.Get(i, j), [x, y, r], this);
			}
		}

		return cells;
	}

	GetRectangle(x0, y0, w, h, metaWrap = true, filter = null) {		
		let [ x1, y1 ] = this.SanitizeRanges(x0 + w, y0 + h),
			cells = [];

		for(let i = x0; i < x1; i++) {
			for(let j = y0; j < y1; j++) {
				this.CheckPerformWrap(filter, metaWrap, cells, i, j, this.Get(i, j), [x0, y0, w, h], this);
			}
		}

		return cells;
	}

	GetAPath(x0, y0, x1, y1, costPlane = null) {
		costPlane = costPlane === null || costPlane === void 0 ? new Plane(this.Width, this.Height, (x, y) => 1) : costPlane;

		if(!(costPlane instanceof Plane)) {
			throw new Error("$costPlane must be of type `Plane`");
		}

		//* Ensure that the "travel sequence" is the order that the populates $path
		let path = [];
		// TODO

		return path;
	}
}

export default Plane;