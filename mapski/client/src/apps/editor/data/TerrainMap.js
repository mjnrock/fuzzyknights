import { Terrain } from "../../../modules/terrain/Terrain.js";

export const TerrainDict = {
	VOID: { type: "VOID", cost: Infinity, mask: 0, texture: `#000000` },
	WATER: { type: "WATER", cost: 4, mask: 1, texture: `#3e91af` },
	SAND: { type: "SAND", cost: 2, mask: 1, texture: `#dcdbc2` },
	DIRT: { type: "DIRT", cost: 1, mask: 3, texture: `#7b674a` },
	GRASS: { type: "GRASS", cost: 1, mask: 7, texture: `#5d8c53` },
	ROCK: { type: "ROCK", cost: 2, mask: 3, texture: `#908c87` },
	SNOW: { type: "SNOW", cost: 2, mask: 1, texture: `#fffafa` },

	VOID2: { type: "VOID2", cost: 2*Infinity, mask: 0, texture: `#009000` },
	WATER2: { type: "WATER2", cost: 2*4, mask: 1, texture: `#3e91af` },
	SAND2: { type: "SAND2", cost: 2*2, mask: 1, texture: `#dc9bc2` },
	DIRT2: { type: "DIRT2", cost: 2*1, mask: 3, texture: `#7b974a` },
	GRASS2: { type: "GRASS2", cost: 2*1, mask: 7, texture: `#5d9c53` },
	ROCK2: { type: "ROCK2", cost: 2*2, mask: 3, texture: `#909c87` },
	SNOW2: { type: "SNOW2", cost: 2*2, mask: 1, texture: `#ff9afa` },
};

export const TerrainMapData = {};
for(const [ key, terrainObj ] of Object.entries(TerrainDict)) {
	const terrain = Terrain.New(terrainObj);

	TerrainMapData[ key ] = terrain;
};