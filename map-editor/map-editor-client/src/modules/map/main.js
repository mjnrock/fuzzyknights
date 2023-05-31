import { Module } from "../../lib/Module.js";

import { Seed as MapRandomSeedData } from "./../../data/modules/map/seed.js";

export const EnumActions = {
	RANDOMIZE: "RANDOMIZE",
	SOLID_FILL: "SOLID_FILL",
	SET_TILE_DATA: "SET_TILE_DATA",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: MapRandomSeedData(),
		reducers: [
			(state, payload) => {
				switch(payload && payload.type) {
					case EnumActions.RANDOMIZE:
						return MapRandomSeedData();
					case EnumActions.SOLID_FILL:
						return MapRandomSeedData({ tileData: payload.data });
					case EnumActions.SET_TILE_DATA:
						return state.setTile(payload.data.x, payload.data.y, payload.data.data);
					default:
						return state;
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