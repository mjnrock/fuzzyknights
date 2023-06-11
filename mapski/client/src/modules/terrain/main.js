import { Module } from "../../lib/Module.js";

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
	const module = new Module({
		state: {
			selected: 2,
			terrains: terrainMap,	// new Map(),
		},
		reducers: [
			(state, payload) => {
				if(payload && payload.type) {
					if(payload.type === EnumActions.SELECT_TERRAIN) {
						const next = state;//structuredClone(state);

						return {
							...next,
							selected: payload.data,
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_TEXTURE) {
						const { key, texture } = payload.data;

						const next = state;//structuredClone(state);

						const terrain = next.terrains[ key ];
						next.terrains[ key ] = new Terrain({
							...terrain,
							texture,
						});

						console.log("SET_TERRAIN_TEXTURE", next.terrains[ key ])

						return {
							...next,
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_MAP) {
						const next = state;//structuredClone(state);

						const map = new Map(next.terrains);
						for(const [ key, terrainObj ] of payload.data) {
							const terrain = new Terrain(terrainObj);

							map.set(key, terrain);
						}

						return {
							...next,
							terrains: map,
						};
					} else {
						return state;
					}
				}
			},
		],
		...args,
	});

	return module;
};

export default {
	Generate,
	Enum: {
		Actions: EnumActions,
	},
};