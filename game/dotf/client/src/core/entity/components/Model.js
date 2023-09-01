export const Name = `model`;

export const State = ({ ...rest } = {}) => ({
	type: "CIRCLE",
	radius: 10,	//px
	ox: 0,	//px
	oy: 0,	//px

	...rest,
});

export const Reducers = () => ({
	setType(state, { type }) {
		return {
			...state,
			type,
		};
	},
	setRadius(state, { radius }) {
		return {
			...state,
			radius,
		};
	},
	setOffset(state, { ox, oy }) {
		return {
			...state,
			ox,
			oy,
		};
	},
});

export default {
	Name,
	State,
	Reducers,
};