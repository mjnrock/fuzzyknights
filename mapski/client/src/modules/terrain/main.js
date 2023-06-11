import { Module } from "../../lib/Module.js";

export const EnumActions = {
	SELECT_TERRAIN: "SELECT_TERRAIN",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: {
			selected: 2,
			terrains: new Map(),
		},
		reducers: [
			(state, payload) => {
				switch(payload && payload.type) {
					case EnumActions.SELECT_TERRAIN:
						const next = structuredClone(state);

						return {
							...next,
							selected: payload.data,
						};
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