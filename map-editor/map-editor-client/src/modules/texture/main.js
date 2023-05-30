import { Module } from "../../lib/Module.js";

export const EnumActions = {
	SELECT_TEXTURE: "SELECT_TEXTURE",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: {
			selected: 0,
			textures: new Map(),
		},
		reducers: [
			(state, payload) => {
				switch(payload && payload.type) {
					case EnumActions.SELECT_TEXTURE:
						return {
							...state,
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
	Enum: {},
};