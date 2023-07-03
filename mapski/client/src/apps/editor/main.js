import TileMapData from "../../modules/map/TileMap";
import Terrain from "../../modules/terrain/Terrain";

import { Node } from "../../lib/Node";

import { TerrainDict, TerrainMapData } from "./data/TerrainMap";

import { BsFolder2Open, BsSave } from 'react-icons/bs';

export const Reducers = {
	menubar: {},
	map: {
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
			if(autoSize) {
				// when autoSize is checked, resize canvas too
				width = tw * columns;
				height = th * rows;
			}
			return {
				...state,
				tw: Math.max(tw, 1),
				th: Math.max(th, 1),
				width,
				height,
			};
		},
		resizeScale: (state, [ sw, sh ]) => {
			return {
				...state,
				sw: Math.min(Math.max(sw, 0.1), 10),
				sh: Math.min(Math.max(sh, 0.1), 10),
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
					const current = State.map?.state?.tiles?.[ y ]?.[ x ];
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
				const tile = State.map?.state?.tiles?.[ y ]?.[ x ];
				if(tile) {
					return {
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
				}
			}

			return state;
		},
		solidFill: (state, data) => {
			const currentTerrain = State.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.
			return TileMapData.Next({
				...state,
				tileData: currentTerrain,
			});
		},
		randomize: (state, data) => {
			const tiles = {};
			for(let y = 0; y < state.rows; y++) {
				for(let x = 0; x < state.columns; x++) {
					const index = Math.floor(Math.random() * Object.keys(TerrainDict).length);
					const data = Object.values(TerrainDict)[ index ].type;

					tiles[ y ] = tiles[ y ] || {};
					tiles[ y ][ x ] = {
						x,
						y,
						data,
					};
				}
			}

			return {
				...state,
				tiles,
			};
		},
		pan: (state, [ deltaX, deltaY ]) => {
			return {
				...state,
				offsetX: state.offsetX + deltaX,
				offsetY: state.offsetY + deltaY,
			};
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
			return {
				...state,
				...data,
			};
		},

		down: (state) => {
			const currentTerrain = State.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.

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
					data: State.terrain?.state?.selected || null,
				}));

				IMM("map", {
					type: "setTileData",
					data: tileData,
				});
			}

			return {
				...state,
				isActive: false,
			};
		},

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

export const State = Node.CreateMany({
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
			columns: 10,
			rows: 10,
			tw: 64,
			th: 64,
			sw: 1.0,
			sh: 1.0,
			width: 640,
			height: 640,
			autoSize: true,
			offsetX: 0,
			offsetY: 0,
			// STUB: This is using example data
			tileData: (x, y) => {
				const index = Math.floor(Math.random() * Object.keys(TerrainDict).length);
				const data = Object.values(TerrainDict)[ index ].type;

				return data;
			},
		}),
		reducers: Reducers.map,
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
	const node = State[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};
export const IMS = (module) => {
	const node = State[ module ];
	if(node) {
		return node.state;
	}
};