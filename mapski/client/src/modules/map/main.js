import { Node } from "../../lib/Node.js";
import { toObject } from "../../util/copy.js";

import { Seed as MapRandomSeedData } from "../../data/modules/map/seed.js";

export const EnumActions = {
	RESIZE: "RESIZE",
	RESIZE_TILES: "RESIZE_TILES",

	RANDOMIZE: "RANDOMIZE",
	SOLID_FILL: "SOLID_FILL",
	SET_TILE_DATA: "SET_TILE_DATA",
};

export const Generate = ({ ...args } = {}) => {
	const node = new Node({
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
					return toObject(state.setTiles(...payload.data));
				}

				return toObject(state);
			},
		],
		...args,
	});

	return node;
};

export default {
	Generate,
	Enum: {
		Actions: EnumActions,
	},
};