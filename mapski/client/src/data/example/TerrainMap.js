import { Terrain } from "../../modules/terrain/Terrain.js";

export const TerrainDict = {
	VOID: { type: "VOID", cost: Infinity, mask: 0, texture: `#000000` },
	WATER: { type: "WATER", cost: 4, mask: 1, texture: `#3e91af` },
	SAND: { type: "SAND", cost: 2, mask: 1, texture: `#dcdbc2` },
	DIRT: { type: "DIRT", cost: 1, mask: 3, texture: `#7b674a` },
	GRASS: { type: "GRASS", cost: 1, mask: 7, texture: `#5d8c53` },
	ROCK: { type: "ROCK", cost: 2, mask: 3, texture: `#908c87` },
	SNOW: { type: "SNOW", cost: 2, mask: 1, texture: `#fffafa` },
};

// STUB
export const TerrainMapData = {};
for(const [ key, terrainObj ] of Object.entries(TerrainDict)) {
	const terrain = Terrain.New(terrainObj);

	TerrainMapData[ key ] = terrain;
}