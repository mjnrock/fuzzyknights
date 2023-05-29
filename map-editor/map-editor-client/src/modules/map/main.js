import { Module } from "../../lib/Module.js";
import { bindReact } from "../../lib/ReactModule.js";

import { Seed as MapRandomSeedData } from "./../../data/modules/map/seed.js";

export const EnumActions = {
	RANDOMIZE: "RANDOMIZE",
	SOLID_FILL: "SOLID_FILL",
	SET_TILE_DATA: "SET_TILE_DATA",
};

export const MapModule = new Module({
	state: MapRandomSeedData(),
	reducers: [
		(state, payload) => {
			switch(payload && payload.type) {
				case EnumActions.RANDOMIZE:
					return MapRandomSeedData();
				case EnumActions.SOLID_FILL:
					return MapRandomSeedData({ tileData: payload.data });
				case EnumActions.SET_TILE_DATA:
					state.setTile(payload.data.x, payload.data.y, payload.data.data);

					return state;
				default:
					return state;
			}
		},
	],
});

export const MapModuleReact = bindReact(MapModule);

export default {
	MapModule,
	MapModuleReact,
};