import { useNode } from "../lib/react/useNode";

import TileMapData from "../modules/map/TileMap";
import Terrain from "../modules/terrain/Terrain";

import TileMapJSX from "../modules/map/components/TileMap";
import TileMapSizing from "../modules/map/components/TileMapSizing";
import TerrainMap from "../modules/terrain/components/TerrainMap";

import ViewPalette from "../modules/brushes/components/ViewPalette";

import { Node } from "../lib/Node";

// STUB: This is using example data
import { TerrainDict, TerrainMapData as TerrainMap_ExampleData } from "../data/example/TerrainMap";


/**
 * A reduction namespace is a way to group reducers together
 * for a specific purpose.  This allows for a more "semantic"
 * approach to updating data.  Most commonly, this is used
 * with the useNode hook, which allows for a more "functional"
 * approach to updating data.
 * 
 * NOTE: Reducers are abstracted here so that multiple Nodes could
 * share the same reducer, if desired, rather than having to
 * duplicate the same reducer for each Node.
 */
export const Reducers = {
	map: {
		// Need this in order to seed the added col/rows.
		resize: (state, [ columns, rows ]) => TileMapData.Next({
			...state,
			columns: Math.max(columns, 1),
			rows: Math.max(rows, 1),
		}),
		resizeTile: (state, [ tw, th ]) => ({
			tw: Math.max(tw, 1),
			th: Math.max(th, 1),
		}),
		setTileData: (state, data) => {
			if(Array.isArray(data)) {
				const next = { ...state };
				for(const tile of data) {
					const { x, y, data: tileData } = tile;
					const current = NodeRegistry.map?.state?.tiles?.[ y ]?.[ x ];
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
				const tile = NodeRegistry.map?.state?.tiles?.[ y ]?.[ x ];
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
			const currentTerrain = NodeRegistry.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.
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
	},
	terrain: {
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
			special: 1,
			isActive: false,
		}),

		move: (state, data) => {
			return {
				...state,
				...data,
			};
		},

		down: (state) => {
			const currentTerrain = NodeRegistry.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.

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
				const plus = [
					{ x: x, y: y, data: currentTerrain },
					{ x: x - 1, y: y, data: currentTerrain },
					{ x: x + 1, y: y, data: currentTerrain },
					{ x: x, y: y - 1, data: currentTerrain },
					{ x: x, y: y + 1, data: currentTerrain },
				];

				IMM("map", {
					type: "setTileData",
					data: plus,
				});
			} else if(state.brush === "rectangle") {
				return {
					...state,
					special: [ "rectangle", state.x, state.y ]
				};
			}

			return {
				...state,
				isActive: true,
			};
		},

		up: (state, data) => {
			if(Array.isArray(state.special)) {
				const currentTerrain = NodeRegistry.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.
				const [ , x, y ] = state.special;
				const { x: x2, y: y2 } = state;

				const rectangle = [];
				for(let i = Math.min(x, x2); i <= Math.max(x, x2); i++) {
					for(let j = Math.min(y, y2); j <= Math.max(y, y2); j++) {
						rectangle.push({
							x: i,
							y: j,
							data: currentTerrain,
						});
					}
				}

				IMM("map", {
					type: "setTileData",
					data: rectangle,
				});

				return {
					...state,
					special: 1,
					isActive: false,
				};
			}

			return {
				...state,
				isActive: false,
			};
		},

		point: (state, data) => ({
			...state,
			brush: "point",
		}),

		plus: (state, data) => ({
			...state,
			brush: "plus",
		}),

		rectangle: (state, data) => ({
			...state,
			special: data.data,
			brush: "rectangle",
		}),
	},
};
/**
 * The Registry is a global store of all the data in the app.
 * A Node within this context can be thought of as a "slice"
 * of the global state.  Each node is assigned a UUID (typically
 * its own .id property) and can be accessed by that UUID.
 * Optionally, aliases can be assigned to nodes, which can be
 * used to access the node by that alias, instead.  This allows
 * for a more "semantic" approach to accessing data, but can
 * also be expanded to allow for "namespaced" data, as well,
 * or multiple instances of the same data (e.g. map1, map2, etc.)
 */
export const NodeRegistry = Node.CreateMany({
	map: {
		state: TileMapData.Next({
			columns: 10,
			rows: 10,
			tw: 64,
			th: 64,
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
			terrains: TerrainMap_ExampleData,
		},
		reducers: Reducers.terrain,
	},
	brushes: {
		state: {
			brush: "plus",
			x: null,
			y: null,
			special: 1,
			theta: 0,
			selection: null,
			isActive: false,
		},
		reducers: Reducers.brushes,
		effects: [
			function(action, state, ...args) {
				if(action === "move" && state.isActive === true) {
					IMM("brushes", {
						type: "down",
					});
				}
			},
		],
	},
});

export const IMM = (module, message, ...args) => {
	const node = NodeRegistry[ module ];
	if(node) {
		return node.dispatch(message.type, message.data, ...args);
	}
};

export function Editor() {
	const { state: map, dispatch: mapDispatch } = useNode(NodeRegistry.map, Reducers.map);
	const { state: terrain, dispatch: terrainDispatch } = useNode(NodeRegistry.terrain, Reducers.terrain);
	const { state: brushes, dispatch: brushesDispatch } = useNode(NodeRegistry.brushes, Reducers.brushes);

	return (
		<div className="flex flex-col">
			<div className="flex flex-row">
				<ViewPalette data={ brushes } update={ { mapDispatch, brushesDispatch } } />
			</div>
			<div className="flex flex-row">
				<div className="flex flex-col">
					<TerrainMap data={ terrain } update={ terrainDispatch } />
				</div>

				<div className="flex flex-col">
					<TileMapSizing data={ map } update={ mapDispatch } />
					<div className="cursor-crosshair">
						<TileMapJSX data={ { map, terrain, brushes } } update={ { mapDispatch, brushesDispatch } } />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Editor;