import { Module } from "../../lib/Module.js";
import { bindReact } from "../../lib/ReactModule.js";

export const TextureModule = new Module({
	state: {
		selected: null,
		textures: new Map(),
	},
	reducers: [
		(state, payload) => {
			switch(payload && payload.type) {
				case "SELECT_TEXTURE":
					return {
						...state,
						selected: payload.data,
					};
				default:
					return state;
			}
		},
	]
});

export const TextureModuleReact = bindReact(TextureModule);

export default {
	TextureModule,
	TextureModuleReact,
};