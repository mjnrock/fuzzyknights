import { useNode } from "../v2/lib/react/useNode";

import TileMapData from "../v2/modules/map/TileMap";
import Terrain from "../v2/modules/terrain/Terrain";

import TileMapJSX from "../v2/modules/map/components/TileMap";
import TileMapSizing from "../v2/modules/map/components/TileMapSizing";
import TerrainMap from "../v2/modules/terrain/components/TerrainMap";

import ViewPalette from "../v2/modules/brushes/components/ViewPalette";

import { Node } from "../v2/lib/Node";

// STUB: This is using example data
import { TerrainDict, TerrainMapData as TerrainMap_ExampleData } from "../v2/data/example/TerrainMap";

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
// export const MasterRegistry = Registry.New(Node.CreateManySimple({
// 	map: TileMapData.Next({
// 		columns: 10,
// 		rows: 10,
// 		tw: 64,
// 		th: 64,
// 		// STUB: This is using example data
// 		tileData: (x, y) => {
// 			const index = Math.floor(Math.random() * Object.keys(TerrainDict).length);
// 			const data = Object.values(TerrainDict)[ index ].type;

// 			return data;
// 		},
// 	}),
// 	terrain: {
// 		selected: null,
// 		// STUB: This is using example data
// 		terrains: TerrainMap_ExampleData,
// 	},
// }));
export const State = {
	...Node.CreateManySimple({
		map: TileMapData.Next({
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
		terrain: {
			selected: null,
			// STUB: This is using example data
			terrains: TerrainMap_ExampleData,
		},
	}),
	...Node.CreateMany({
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
			effects: [
				(node, state, next) => {
					console.log("brushes", state, next);

					//FIXME: Do not allow for stacked reducers, refactor to named reducers only (i.e. no arrays, only objects)

					if(next.type === "move" && state.isActive === true) {
						dispatch("brushes", {
							type: "down",
							data: true,
						});
					}
				},
			],
		},
	}),
};

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
			const currentTerrain = State.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.

			if(state.brush === "eraser") {
				dispatch("map", {
					type: "setTileData",
					data: {
						x: state.x,
						y: state.y,
						data: null,
					},
				});
			} else if(state.brush === "point") {
				dispatch("map", {
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

				dispatch("map", {
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
				const currentTerrain = State.terrain?.state?.selected || null;	// This assumes that 0 is the null terrain key (i.e. { 0: null }.
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

				dispatch("map", {
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
const Effects = {

};
const dispatch = (key, msg) => {
	let next = State[ key ].state;
	if(Array.isArray(Reducers[ key ])) {
		/* If an array, iteratively reduce the state */
		next = Reducers[ key ].reduce((state, reducer) => reducer(state, msg), next);
	} else if(msg.type in Reducers[ key ]) {
		/* If an object, use the type as a key to the reducer */
		next = Reducers[ key ][ msg.type ](next, msg.data);
	}

	if(next !== State[ key ].state) {
		State[ key ].dispatch(next);
	}

	if(Array.isArray(Effects[ key ])) {
		Effects[ key ].forEach(effect => effect({ ...next }, msg));
	}
};

/**
 * The general idea here is that the "update" prop fn receives a { type, data } object,
 * and `dispatch` uses that .type to find a reducer of the same name in the passed map.
 * This is separated into `node` and `reducer maps` so that multiple nodes can share
 * the same reducer, if desired (e.g. multiple maps, multiple players, etc.)
 */
export function Default() {
	const { state: map, dispatch: mapDispatch } = useNode(State.map, Reducers.map);
	const { state: terrain, dispatch: terrainDispatch } = useNode(State.terrain, Reducers.terrain);
	const { state: brushes, dispatch: brushesDispatch } = useNode(State.brushes, Reducers.brushes);

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

export default Default;