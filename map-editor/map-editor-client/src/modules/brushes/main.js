import { Module } from "../../lib/Module.js";

import { EnumActions as EnumMapActions } from "../map/main.js";

export const EnumActions = {
	MOVE: "MOVE",
	DOWN: "DOWN",
	UP: "UP",

	SELECTION: "SELECTION",
	SELECTION_MOVE: "SELECTION_MOVE",
	SELECTION_FILL: "SELECTION_FILL",
	SELECTION_DELETE: "SELECTION_DELETE",
	SELECTION_COPY: "SELECTION_COPY",
	SELECTION_PASTE: "SELECTION_PASTE",
	SELECTION_CUT: "SELECTION_CUT",

	ERASER: "ERASER",
	POINT: "POINT",
	PLUS: "PLUS",
	LINE: "LINE",
	RECTANGLE: "RECTANGLE",
	ELLIPSE: "ELLIPSE",
	POLYGON: "POLYGON",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: {
			brush: EnumActions.POINT,
			x: null,
			y: null,
			size: 1,
			theta: 0,
			selection: null,
			isActive: false,
		},
		reducers: [
			(state, payload, self) => {
				switch(payload && payload.type) {
					case EnumActions.MOVE:
						return {
							...state,
							x: payload.x,
							y: payload.y,
						};
					case EnumActions.DOWN:
						console.log(state.brush);
						const currentTexture = self.$query("texture", "selected");

						switch(state.brush) {
							case EnumActions.POINT:
								self.$dispatch("map", {
									type: EnumMapActions.SET_TILE_DATA,
									data: [ { x: state.x, y: state.y, data: currentTexture } ],
								});

								break;
							case EnumActions.PLUS:
								const plus = [
									{ x: state.x, y: state.y, data: currentTexture },
									{ x: state.x - 1, y: state.y, data: currentTexture },
									{ x: state.x + 1, y: state.y, data: currentTexture },
									{ x: state.x, y: state.y - 1, data: currentTexture },
									{ x: state.x, y: state.y + 1, data: currentTexture },
								];

								self.$dispatch("map", {
									type: EnumMapActions.SET_TILE_DATA,
									data: plus,
								});

								break;
						}

						return {
							...state,
							isActive: true,
						};
					case EnumActions.UP:
						return {
							...state,
							isActive: false,
						};
					case EnumActions.POINT:
						return {
							...state,
							brush: EnumActions.POINT,
						};
					case EnumActions.PLUS:
						return {
							...state,
							brush: EnumActions.PLUS,
						};
					default:
						return state;
				}
			},
		],
		effects: [
			(state, payload, self) => {
				if(payload.type === EnumActions.MOVE && state.isActive === true) {
					self.dispatch({
						type: EnumActions.DOWN,
					});
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