import Chord from "@lespantsfancy/chord";

import TileMapData from "./modules/map/TileMap";
import Terrain from "./modules/terrain/Terrain";

import { TerrainDict, TerrainMapData } from "./data/TerrainMap";

import { BsFolder2Open, BsSave } from "react-icons/bs";

import { CellularAutomata } from "../../../util/algorithms/CellularAutomata";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { clone } from "../../../util/clone";

import { debounce } from "../../../util/debounce";

//TODO: Implement a "MasterNode" that is responsible for the orchestration of all other nodes
// export const MasterNode = Chord.Node.MasterNode.Create({

// });

export const Reducers = {
	menubar: {},
	map: {
		reversion: (state, data) => {
			return TileMapData.Next(data);
		},
		set: (state, data) => {
			return TileMapData.Next(data);
		},
		merge: (state, data) => {
			return TileMapData.Next({
				...state,
				...data,
			});
		},
		resize: (state, [ columns, rows ]) => {
			let { width, height, tw, th, autoSize } = state;
			if(autoSize) {
				// when autoSize is checked, resize canvas too
				width = tw * columns;
				height = th * rows;
			}

			return TileMapData.Next({
				...state,
				columns: Math.max(columns, 1),
				rows: Math.max(rows, 1),
				width,
				height,
			});
		},
		resizeTile: (state, [ tw, th ]) => {
			let { width, height, columns, rows, autoSize } = state;
			let newTw = Math.max(tw, 1),
				newTh = Math.max(th, 1);

			if(autoSize) {
				// when autoSize is checked, resize canvas too
				width = newTw * columns;
				height = newTh * rows;
			}

			if(newTw === state.tw && newTh === state.th) {
				return state;
			}

			return {
				...state,
				offsetX: ~~(state.offsetX - (state.offsetX % (newTw * state.sw))),
				offsetY: ~~(state.offsetY - (state.offsetY % (newTh * state.sh))),
				tw: newTw,
				th: newTh,
				width,
				height,
			};
		},
		resizeScale: (state, [ sw, sh ]) => {
			let newSw = Math.min(Math.max(sw, 0.125), 10),
				newSh = Math.min(Math.max(sh, 0.125), 10);

			if(newSw === state.sw && newSh === state.sh) {
				return state;
			}

			return {
				...state,
				offsetX: ~~(state.offsetX - (state.offsetX % (state.tw * newSw))),
				offsetY: ~~(state.offsetY - (state.offsetY % (state.th * newSh))),
				sw: newSw,
				sh: newSh,
			};
		},
		resizeCanvas: (state, [ width, height ]) => {
			return {
				...state,
				width: Math.max(width, 1),
				height: Math.max(height, 1),
			};
		},
		toggleAutoSize: (state, autoSize) => {
			let { width, height, tw, th, columns, rows } = state;
			if(autoSize) {
				// when autoSize is checked, resize canvas too
				width = tw * columns;
				height = th * rows;
			}
			return {
				...state,
				width,
				height,
				autoSize,
			};
		},
		setTileData: (state, data) => {
			if(Array.isArray(data)) {
				const next = { ...state };
				for(const tile of data) {
					const { x, y, data: tileData } = tile;
					const current = Nodes.map?.state?.tiles?.[ y ]?.[ x ];
					if(current) {
						next.tiles[ y ][ x ] = {
							...current,
							data: tileData,
						};
					}
				}

				return {
					...next,
				};
			} else if(typeof data === "object") {
				const { x, y, data: tileData } = data;
				const tile = Nodes.map?.state?.tiles?.[ y ]?.[ x ];
				if(tile) {
					if(tile.data === tileData) {
						return state;
					}

					const next = {
						...state,
						tiles: {
							...state.tiles,
							[ y ]: {
								...state.tiles[ y ],
								[ x ]: {
									...tile,
									data: tileData,
								},
							},
						},
					};

					return next;
				}
			}

			return state;
		},
		algorithm: (state, data) => {
			let algorithms = state.algorithms || {};
			let algorithm = data?.algorithm || null;

			if(typeof algorithm === "string") {
				algorithm = algorithms[ algorithm ];
			}

			if(typeof algorithm !== "function") {
				return state;
			}

			const tileMap = new Map();
			const algorithmState = {};
			// Prepopulate tileMap with default values
			// In this context, this gives the algorithm access to the entire tileMap, if needed
			for(let y = 0; y < state.rows; y++) {
				for(let x = 0; x < state.columns; x++) {
					tileMap.set(`${ x },${ y }`, {
						x,
						y,
						data: null,
					});
				}
			}
			for(let y = 0; y < state.rows; y++) {
				for(let x = 0; x < state.columns; x++) {
					const key = `${ x },${ y }`;
					let currentObject = tileMap.get(key);
					let resultObject = algorithm(x, y, key, tileMap, state, data, algorithmState);

					// Merge the default object with the result from your algorithm
					const mergedObject = {
						...currentObject,
						...resultObject
					};
					// Set the merged object as the new value in tileMap
					tileMap.set(`${ x },${ y }`, mergedObject);
				}
			}

			const tiles = [];
			for(const [ key, value ] of tileMap.entries()) {
				const [ x, y ] = key.split(",").map(Number);
				tiles[ y ] = tiles[ y ] || [];
				tiles[ y ][ x ] = value;
			}

			return {
				...state,
				tiles,
			};
		},
		pan: (state, [ deltaX, deltaY ]) => {
			let newOffsetX = (state.offsetX || 0) + (deltaX * state.tw * state.sw * -1);
			let newOffsetY = (state.offsetY || 0) + (deltaY * state.th * state.sh * -1);

			// Calculate the residuals
			let residualX = newOffsetX % (state.tw * state.sw);
			let residualY = newOffsetY % (state.th * state.sh);

			// Adjust for the residuals if they exist
			if(residualX !== 0) {
				newOffsetX += residualX * state.sw * Math.sign(deltaX);
			}
			if(residualY !== 0) {
				newOffsetY += residualY * state.sh * Math.sign(deltaY);
			}

			return {
				...state,
				offsetX: ~~newOffsetX,
				offsetY: ~~newOffsetY,
			};
		},
		offset: (state, [ offsetX, offsetY, alignToTiles = false ]) => {
			let newOffsetX = offsetX || 0;
			let newOffsetY = offsetY || 0;

			if(alignToTiles) {
				return {
					...state,
					offsetX: ~~(newOffsetX - (newOffsetX % (state.tw * state.sw))),
					offsetY: ~~(newOffsetY - (newOffsetY % (state.th * state.sh))),
				};
			}

			return {
				...state,
				offsetX: ~~newOffsetX,
				offsetY: ~~newOffsetY,
			};
		},
	},
	history: {
		set: (state, data) => {
			return {
				...data,
			};
		},
		setIndex: (state, data) => {
			const { history, index } = state;
			const next = {
				...state,
				index: Math.min(Math.max(data, 0), history.length - 1),
			};

			return next;
		},
		push: (state, data) => {
			const { history, index } = state;
			const next = {
				...state,
				history: [
					...history,
					data,
				],
				index: index + 1,
			};

			return next;
		},
		undo: (state, data = {}) => {
			const { history, index } = state;
			const { cull } = data;

			let next;
			if(cull) {
				next = {
					...state,
					history: history.slice(0, index),
					index: Math.max(index - 1, 0),
				};
			} else {
				next = {
					...state,
					index: Math.max(index - 1, 0),
				};
			}

			return next;
		},
		redo: (state, data = {}) => {
			const { history, index } = state;
			const next = {
				...state,
				index: Math.max(Math.min(index + 1, history.length - 1), 0),
			};

			return next;
		},
		cull: (state) => {
			const { history, index } = state;

			let boundedIndex = Math.max(Math.min(index + 1, history.length), 0);
			if(boundedIndex === history.length) {
				return state;
			}

			const next = {
				...state,
				history: history.slice(0, boundedIndex),
				index: Math.max(boundedIndex, 0),
			};

			return next;
		},
		rebase: (state) => {
			const { history, index } = state;
			const next = {
				...state,
				history: [ history[ index ] ],
				index: 0,
			};

			return next;
		},
	},
	terrain: {
		set: (state, data) => {
			return {
				...data
			};
		},
		merge: (state, data) => {
			return {
				...state,
				...data,
			};
		},
		addTerrain: (state, data) => {
			return {
				...state,
				terrains: {
					...state.terrains,
					[ data.type ]: Terrain.New(data),
				},
			};
		},
		selectTerrain: (state, data) => {
			return {
				...state,
				selected: data,
			};
		},
		setTerrainTexture: (state, data) => {
			const next = state;
			const { key, texture } = data;

			const terrain = next.terrains[ key ];
			next.terrains[ key ] = Terrain.New({
				...terrain,
				texture,
			});

			return {
				...next,
			};
		},
		setTerrainMap: (state, data) => {
			const terrains = {};
			for(const [ key, terrainObj ] of Object.entries(data)) {
				const terrain = Terrain.New(terrainObj);

				terrains[ key ] = terrain;
			}

			return {
				...state,
				terrains,
			};
		},
	},
	brushes: {
		deselect: (state, data) => ({
			...state,
			special: null,
			isActive: false,
		}),

		move: (state, data) => {
			const next = {
				...state,
				...data,
			};

			if(state.isActive === true) {
				if(state.brush === "pan") {
					IMM("map", {
						type: "pan",
						data: [ data.deltaX, data.deltaY ],
					});
				}
			}

			return next;
		},

		down: (state) => {
			const currentTerrain = Nodes.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.

			if(state.brush === "eraser") {
				IMM("map", {
					type: "setTileData",
					data: {
						x: state.x,
						y: state.y,
						data: null,
					},
				});
			} else if(state.brush === "point") {
				IMM("map", {
					type: "setTileData",
					data: {
						x: state.x,
						y: state.y,
						data: currentTerrain,
					},
				});
			} else if(state.brush === "plus") {
				const { x, y } = state;

				IMM("map", {
					type: "setTileData",
					data: state.brushData.map(([ rx, ry ]) => ({
						x: x + rx,
						y: y + ry,
						data: currentTerrain,
					})),
				});
			}

			const next = {
				...state,
				isActive: true,
			};

			if(!Array.isArray(state.special)) {
				next.special = [ state.x, state.y ];
			}

			return next;
		},

		up: (state, data) => {
			if(state.brush === "rectangle" && state.isActive) {
				const { x, y, special: [ startX, startY ] } = state;
				const { brushData } = state;

				const tileData = brushData(x, y, startX, startY).map(([ rx, ry ]) => ({
					x: rx,
					y: ry,
					data: Nodes.terrain?.state?.selected || null,
				}));

				IMM("map", {
					type: "setTileData",
					data: tileData,
				});
			}

			return {
				...state,
				special: null,
				isActive: false,
			};
		},

		pan: (state, data) => ({
			...state,
			brush: "pan",
			brushData: [],
		}),
		point: (state, data) => ({
			...state,
			brush: "point",
			brushData: [
				[ 0, 0 ],
			],
		}),

		plus: (state, data) => ({
			...state,
			brush: "plus",
			brushData: [
				[ 0, 0 ],
				[ -1, 0 ],
				[ 1, 0 ],
				[ 0, -1 ],
				[ 0, 1 ],
			]
		}),

		rectangle: (state, data) => ({
			...state,
			brushData: (sx, sy, dx, dy) => {
				const rectangle = [];
				for(let i = Math.min(sx, dx); i <= Math.max(sx, dx); i++) {
					for(let j = Math.min(sy, dy); j <= Math.max(sy, dy); j++) {
						rectangle.push([ i, j ]);
					}
				}

				return rectangle;
			},
			brush: "rectangle",
		}),
	},
};

export const Nodes = Chord.Node.Node.CreateMany({
	menubar: {
		state: {
			menu: [
				{
					name: "File",
					command: "File",
					submenu: [
						{
							name: "Save",
							command: "file/save",
							icon: BsSave,
							// shortcut: "Ctrl+S",
						},
						{
							name: "Load",
							command: "file/load",
							icon: BsFolder2Open,
							// shortcut: "Ctrl+O",
						},
					],
				},
			],
		},
		reducers: Reducers.menubar,
	},
	map: {
		state: TileMapData.Next({
			columns: 25,
			rows: 25,
			tw: 32,
			th: 32,
			sw: 1.0,
			sh: 1.0,
			width: 800,
			height: 800,
			autoSize: true,
			offsetX: 0,
			offsetY: 0,
			// STUB: This is using example data
			tileData: (x, y) => {
				const index = Math.floor(Math.random() * Object.keys(TerrainDict).length);
				const data = Object.values(TerrainDict)[ index ].type;

				return data;
			},

			algorithms: {
				selectedFill: (x, y, key, tileMap, state, data) => ({
					data: Nodes.terrain?.state?.selected || null,
				}),
				randomize: (x, y, key, tileMap, state, data) => {
					const seed = data?.seed != null ? data.seed : Date.now();
					const index = Math.floor(alea(`${ seed }${ x }${ y }`)() * Object.keys(TerrainDict).length);
					const value = Object.values(TerrainDict)[ index ].type;

					return {
						data: value,
					};
				},
				simplexNoise: (x, y, key, tileMap, state, data, algorithmState) => {
					if(!algorithmState.noise2D) {
						const seed = data?.seed != null ? data.seed : Date.now();

						algorithmState.noise2D = createNoise2D(alea(seed));
					}

					const value = algorithmState.noise2D(x / 10, y / 10);

					// const index = Math.floor(Math.abs(value) * Object.keys(TerrainDict).length);
					//FIXME -- Currently uses all available terrain types, which may not be desirable
					//STUB
					const index = Math.floor(Math.abs(value) * (Object.keys(TerrainDict).length - 1)) + 1;
					const terrain = Object.values(TerrainDict)[ index ];

					return {
						data: terrain.type,
					};
				},
				cellularAutomata: (x, y, key, tileMap, state, data, algorithmState) => {
					if(!algorithmState.map) {
						const generator = new CellularAutomata(Nodes.map?.state?.columns, Nodes.map?.state?.rows, ...(data?.args || []));
						const map = generator.generate();

						algorithmState.map = map;
						algorithmState.lookup = (x, y) => {
							const value = map[ y ]?.[ x ];
							if(value) {
								return value;
							}

							return null;
						};
					}

					return {
						data: algorithmState.lookup(x, y) ? TerrainDict.VOID.type : TerrainDict.DIRT.type,
					};
				},
			},
		}),
		reducers: Reducers.map,
		events: {
			update: [
				/* Reduce the eagerness of history state updates with a debounce */
				debounce((state, previous, action) => {
					if(action !== "reversion") {
						if(JSON.stringify(state.tiles) !== JSON.stringify(previous.tiles)) {
							let currentHistoryIndex = Nodes.history?.state?.index || 0;
							let currentHistory = Nodes.history?.state?.history || [];

							if(currentHistoryIndex !== currentHistory.length - 1) {
								currentHistory = currentHistory.slice(0, currentHistoryIndex + 1);
								IMM("history", {
									type: "set",
									data: {
										history: currentHistory,
										index: currentHistoryIndex,
									},
								});
							}

							IMM("history", {
								type: "push",
								data: {
									type: "map",
									state: clone(state),
								},
							});
						}
					}
				}, 650),
			],
		},
	},
	history: {
		state: {
			history: [],
			index: -1,
		},
		reducers: Reducers.history,
		effects: {
			undo: [
				(state) => {
					const { history, index } = state;
					const reversion = history[ index ];

					if(reversion) {
						IMM(reversion.type, {
							type: "reversion",
							data: reversion.state,
						});
					}
				},
			],
			redo: [
				(state) => {
					const { history, index } = state;
					const reversion = history[ index ];

					if(reversion) {
						IMM(reversion.type, {
							type: "reversion",
							data: reversion.state,
						});
					}
				}
			],
		},
	},
	terrain: {
		state: {
			selected: null,
			// STUB: This is using example data
			terrains: TerrainMapData,
		},
		reducers: Reducers.terrain,
	},
	brushes: {
		state: {
			brush: "plus",
			brushData: [
				[ 0, 0 ],
				[ -1, 0 ],
				[ 1, 0 ],
				[ 0, -1 ],
				[ 0, 1 ],
			],
			x: null,
			y: null,
			theta: 0,
			selection: null,
			isActive: false,
		},
		reducers: Reducers.brushes,
		effects: {
			move: [
				function (state, ...args) {
					if(state.isActive === true) {
						IMM("brushes", {
							type: "down",
						});
					}
				}
			],
		},
	},
});

export const IMM = (module, message, ...args) => {
	const node = Nodes[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};
export const IMS = (module) => {
	const node = Nodes[ module ];
	if(node) {
		return node.state;
	}
};