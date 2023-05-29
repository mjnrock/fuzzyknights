import { Module } from "../../lib/Module.js";
import { bindReact } from "../../lib/ReactModule.js";

export const MapModule = new Module({
	state: {
		rows: 10,
		columns: 10,
		tiles: {},
	},
	reducers: [
		(state, ...args) => {
			return {
				...state,
				now: Date.now(),
			};
		},
	],
	effects: [
		(state, ...args) => {
			console.log("MapModule effect", state, args);
		},
	],
	listeners: {
		[Module.EventTypes.PRE_INIT]: () => console.log("MapModule pre"),
		[Module.EventTypes.INIT]: () => console.log("MapModule init"),
		[Module.EventTypes.POST_INIT]: () => console.log("MapModule post"),
	},
	$init: [],
});

export const MapModuleReact = bindReact(MapModule);

export default {
	MapModule,
	MapModuleReact,
};