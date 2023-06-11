import { Module } from "../../lib/Module.js";

import { Terrain } from "./lib/Terrain.js";

import { TerrainMap } from "../../data/stub/TerrainMap.js";

// STUB
const terrainMap = new Map();
for(const [ key, terrainObj ] of Object.entries(TerrainMap)) {
	const terrain = new Terrain(terrainObj);

	terrainMap.set(key, terrain);
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
						const next = structuredClone(state);

						return {
							...next,
							selected: payload.data,
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_TEXTURE) {
						const { texture } = payload.data;

						const next = structuredClone(state);

						//FIXME: "selected" isn't relevant here -- it should be the "texture" (i.e. the image file) (though also decide if file, or canvas instead here)
						const terrain = next.terrains.get(next.selected);
						next.terrains.set(next.selected, terrain.setTexture(texture));

						return {
							...next,
							terrains: new Map(next.terrains),
						};
					} else if(payload.type === EnumActions.SET_TERRAIN_MAP) {
						const next = structuredClone(state);

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