import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({

});

export const World = ({ $realm, maps = {}, observers = [], tick, render } = {}) => Identity.New({
	$realm,

	maps,
	observers,

	tick,
	render,
});

export default {
	State: World,
	Reducers,
};