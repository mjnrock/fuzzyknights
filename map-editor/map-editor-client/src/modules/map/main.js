import { Module } from "../../lib/Module.js";
import { bindReact } from "../../lib/ReactModule.js";

import { Seed as MapRandomSeedData } from "./../../data/modules/map/seed.js";

export const MapModule = new Module({
	state: MapRandomSeedData(),
	reducers: [
		(state, payload) => {
			switch(payload && payload.type) {
				case "RANDOMIZE":
					return MapRandomSeedData();
				case "SET_TILE_DATA":
					state.setTile(payload.data.x, payload.data.y, payload.data.data);

					return state;
				default:
					return state;
			}
		},
	],
	// effects: [
	// ],
	listeners: {
		[ Module.EventTypes.PRE_INIT ]: () => console.log("[MapModule::pre]"),
		[ Module.EventTypes.INIT ]: () => console.log("[MapModule::init]"),
		[ Module.EventTypes.POST_INIT ]: () => console.log("[MapModule::post]"),
	},
	$init: [],
	$self: {}
});

export const MapModuleReact = bindReact(MapModule);

export default {
	MapModule,
	MapModuleReact,
};