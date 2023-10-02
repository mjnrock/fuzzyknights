import Identity from "../../@node/Identity";

export const Reducers = ({ $game } = {}) => ({
	setPositionFromEntity: (state, entity) => ({ ...state, position: { x: entity.state.physics.x, y: entity.state.physics.y } }),
});

export const Observer = ({ zone, x, y, shape, subject } = {}) => Identity.Identity.Next({
	zone,
	position: {
		x,
		y,
	},
	shape,
	subject,
});

export default {
	State: Observer,
	Reducers,
};