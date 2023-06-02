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

	POINT: "POINT",
	PLUS: "PLUS",
	RECTANGLE: "RECTANGLE",
	ELLIPSE: "ELLIPSE",
	POLYGON: "POLYGON",
};

export const Generate = ({ ...args } = {}) => {
	const module = new Module({
		state: {
			brush: EnumActions.RECTANGLE,
			x: null,
			y: null,
			special: 1,
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
						const currentTexture = self.$query("texture", "selected") || null;	// This assumes that 0 is the null texture key (i.e. { 0: null }.

						if(state.brush === EnumActions.ERASER) {
							self.$dispatch("map", {
								type: EnumMapActions.SET_TILE_DATA,
								data: [ { x: state.x, y: state.y, data: null } ],
							});
						} else if(state.brush === EnumActions.POINT) {
							self.$dispatch("map", {
								type: EnumMapActions.SET_TILE_DATA,
								data: [ { x: state.x, y: state.y, data: currentTexture } ],
							});
						} else if(state.brush === EnumActions.PLUS) {
							const { x, y } = state;
							const plus = [
								{ x: x, y: y, data: currentTexture },
								{ x: x - 1, y: y, data: currentTexture },
								{ x: x + 1, y: y, data: currentTexture },
								{ x: x, y: y - 1, data: currentTexture },
								{ x: x, y: y + 1, data: currentTexture },
							];

							self.$dispatch("map", {
								type: EnumMapActions.SET_TILE_DATA,
								data: plus,
							});
						} else if(state.brush === EnumActions.RECTANGLE) {
							return {
								...state,
								special: [ EnumActions.RECTANGLE, state.x, state.y ]
							};
						}

						return {
							...state,
							isActive: true,
						};
					case EnumActions.UP:
						if(Array.isArray(state.special)) {
							const currentTexture = self.$query("texture", "selected") || null;	// This assumes that 0 is the null texture key (i.e. { 0: null }.
							const [ , x, y ] = state.special;
							const { x: x2, y: y2 } = state;

							const rectangle = [];
							for(let i = Math.min(x, x2); i <= Math.max(x, x2); i++) {
								for(let j = Math.min(y, y2); j <= Math.max(y, y2); j++) {
									rectangle.push({
										x: i,
										y: j,
										data: currentTexture,
									});
								}
							}

							self.$dispatch("map", {
								type: EnumMapActions.SET_TILE_DATA,
								data: rectangle,
							});

							return {
								...state,
								special: 1,
							};
						}

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
					case EnumActions.RECTANGLE:
						return {
							...state,
							special: payload.data,
							brush: EnumActions.RECTANGLE,
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