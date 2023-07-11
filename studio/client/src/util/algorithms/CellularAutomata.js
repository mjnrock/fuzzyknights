export class CellularAutomata {
	constructor (width = 50, height = 50, initialWallProbability = 0.35, iterations = 2) {
		this.width = width;
		this.height = height;
		this.initialWallProbability = initialWallProbability;
		this.iterations = iterations;
		this.grid = [];
	}

	generate() {
		this.initializeGrid();
		this.randomizeInitialTiles();

		for(let i = 0; i < this.iterations; i++) {
			this.applyCellularAutomataRules();
		}

		return this.grid;
	}

	initializeGrid() {
		this.grid = [];
		for(let y = 0; y < this.height; y++) {
			this.grid[ y ] = [];
			for(let x = 0; x < this.width; x++) {
				this.grid[ y ][ x ] = 0;
			}
		}
	}

	randomizeInitialTiles() {
		for(let y = 0; y < this.height; y++) {
			for(let x = 0; x < this.width; x++) {
				if(Math.random() < this.initialWallProbability) {
					this.grid[ y ][ x ] = 1;
				}
			}
		}
	}

	applyCellularAutomataRules() {
		const newGrid = [];

		for(let y = 0; y < this.height; y++) {
			newGrid[ y ] = [];
			for(let x = 0; x < this.width; x++) {
				const wallCount = this.countWallNeighbors(x, y);
				if(this.grid[ y ][ x ] === 1 && wallCount >= 4) {
					newGrid[ y ][ x ] = 1;
				} else if(this.grid[ y ][ x ] === 0 && wallCount >= 5) {
					newGrid[ y ][ x ] = 1;
				} else {
					newGrid[ y ][ x ] = 0;
				}
			}
		}

		this.grid = newGrid;
	}

	countWallNeighbors(x, y) {
		let wallCount = 0;

		for(let j = -1; j <= 1; j++) {
			for(let i = -1; i <= 1; i++) {
				const neighborX = x + i;
				const neighborY = y + j;

				if(this.isInsideGrid(neighborX, neighborY)) {
					if(this.grid[ neighborY ][ neighborX ] === 1) {
						wallCount++;
					}
				} else {
					// Consider out-of-bounds positions as walls
					wallCount++;
				}
			}
		}

		return wallCount;
	}

	isInsideGrid(x, y) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}
};

export default CellularAutomata;