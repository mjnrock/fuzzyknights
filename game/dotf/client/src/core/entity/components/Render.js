import * as PIXI from "pixi.js";

export const Name = `render`;

export const State = ({ ...rest } = {}) => ({
	sprite: new PIXI.Graphics(),

	...rest,
});

export const Reducers = () => ({
	setSprite(state, { sprite }) {
		return {
			...state,
			sprite,
		};
	},
});

export default {
	Name,
	State,
	Reducers,
};