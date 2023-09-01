export const Name = `state`;

export const State = ({ ...rest } = {}) => ({
	current: "IDLE",
	default: "IDLE",

	...rest,
});

export const Reducers = () => ({
	setCurrent(state, { current }) {
		return {
			...state,
			current,
		};
	},
	setDefault(state, { default: def }) {
		return {
			...state,
			default: def,
		};
	},
});

export default {
	Name,
	State,
	Reducers,
};