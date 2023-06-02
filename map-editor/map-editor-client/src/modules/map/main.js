import { Module } from "../../lib/Module.js";

import { Seed as MapRandomSeedData } from "./../../data/modules/map/seed.js";

export const EnumActions = {
	RESIZE: "RESIZE",

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
					case EnumActions.RESIZE:
						const [ newWidth, newHeight ] = payload.data;

						return MapRandomSeedData({
							rows: newHeight || state.rows,
							columns: newWidth || state.columns,
						});
					case EnumActions.RANDOMIZE:
						return MapRandomSeedData({ ...state });
					case EnumActions.SOLID_FILL:
						return MapRandomSeedData({ ...state, tileData: payload.data });
					case EnumActions.SET_TILE_DATA:
						return state.setTiles(...payload.data);
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