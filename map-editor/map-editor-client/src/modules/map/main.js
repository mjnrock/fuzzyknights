import { Module } from "../../lib/Module.js";

import { Seed as MapRandomSeedData } from "./../../data/modules/map/seed.js";

export const EnumActions = {
	RESIZE: "RESIZE",
	RESIZE_TILES: "RESIZE_TILES",

	RANDOMIZE: "RANDOMIZE",
	SOLID_FILL: "SOLID_FILL",
	SET_TILE_DATA: "SET_TILE_DATA",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: MapRandomSeedData(),
		reducers: [
			(state, payload) => {
				if(payload.type === EnumActions.RESIZE) {
					const [ newCols, newRows ] = payload.data;

					return MapRandomSeedData({
						...state,
						rows: newRows || state.rows,
						columns: newCols || state.columns,
					});
				} else if(payload.type === EnumActions.RESIZE_TILES) {
					const [ tw, th ] = payload.data;

					return MapRandomSeedData({
						...state,
						tw: tw || state.tw,
						th: th || state.th,
					});
				} else if(payload.type === EnumActions.RANDOMIZE) {
					return MapRandomSeedData({ ...state }, true);
				} else if(payload.type === EnumActions.SOLID_FILL) {
					return MapRandomSeedData({ ...state, tileData: payload.data }, true);
				} else if(payload.type === EnumActions.SET_TILE_DATA) {
					return state.setTiles(...payload.data);
				}

				return state;
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