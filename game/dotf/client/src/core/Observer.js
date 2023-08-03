import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({

});

export const Observer = ({ map, x, y, shape, subject } = {}) => Identity.New({
	map,
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