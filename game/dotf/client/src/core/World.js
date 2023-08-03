import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({

});

export const World = ({ $world, maps = {}, tick, render } = {}) => Identity.New({
	$world,

	maps,

	tick,
	render,
});

export default {
	State: World,
	Reducers,
};