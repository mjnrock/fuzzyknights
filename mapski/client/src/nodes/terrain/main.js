import { Node } from "../../lib/Node.js";

import { Terrain } from "./lib/Terrain.js";

import { TerrainMap } from "../../data/stub/TerrainMap.js";

// STUB
const terrainMap = {};
for(const [ key, terrainObj ] of Object.entries(TerrainMap)) {
	const terrain = new Terrain(terrainObj);

	terrainMap[ key ] = terrain;
}

export const EnumActions = {
	SELECT_TERRAIN: "SELECT_TERRAIN",
	SET_TERRAIN_TEXTURE: "SET_TERRAIN_TEXTURE",
	SET_TERRAIN_MAP: "SET_TERRAIN_MAP",
};

export const Generate = ({ ...args } = {}) => {
	const node = new Node({
		state: {
			selected: null,
			terrains: terrainMap,	// new Map(),
		},
		reducers: [
			(state, payload, self) => {
				if(payload && payload.type) {
					if(payload.type === EnumActions.SELECT_TERRAIN) {
						return {
							...state,
							selected: payload.data,
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_TEXTURE) {
						const next = state;
						const { key, texture } = payload.data;

						const terrain = next.terrains[ key ];
						next.terrains[ key ] = new Terrain({
							...terrain,
							texture,
						});

						return {
							...next,
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_MAP) {
						const terrains = {};
						for(const [ key, terrainObj ] of Object.entries(payload.data)) {
							const terrain = new Terrain(terrainObj);

							terrains[ key ] = terrain;
						}

						return {
							...state,
							terrains,
						};
					}

					return {
						...state,
					};
				}
			},
		],
		effects: [
			(state, payload, self) => {
				if(payload && payload.type) {
					if(payload.type === EnumActions.SET_TERRAIN_TEXTURE) {
						// Force a map update
						self.$dispatch("map", true);
					}
				}
			},
		],
		...args,
	});

	return node;
};

export default {
	Generate,
	Enum: {
		Actions: EnumActions,
	},
};