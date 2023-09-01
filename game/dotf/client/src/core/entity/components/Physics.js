export const Name = `physics`;

export const State = ({ ...rest } = {}) => ({
	x: 0,
	y: 0,
	theta: 0,

	vx: 0,
	vy: 0,
	speed: 1.33,

	...rest,
});

export const Reducers = () => ({
	setPosition(state, { x, y }) {
		return {
			...state,
			x,
			y,
		};
	},
	setRotation(state, { theta }) {
		return {
			...state,
			theta,
		};
	},
	setVelocity(state, { vx, vy }) {
		return {
			...state,
			vx,
			vy,
		};
	},
	setSpeed(state, { speed }) {
		return {
			...state,
			speed,
		};
	},

	applyVelocity(state, { dt }) {
		return {
			...state,
			x: state.x + state.vx * dt,
			y: state.y + state.vy * dt,
		};
	},
});

export default {
	Name,
	State,
	Reducers,
};