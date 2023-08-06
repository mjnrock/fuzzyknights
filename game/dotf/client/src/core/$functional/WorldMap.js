import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({

});

export const WorldMap = ({ $world, tiles = [], entities = {}, portals = {}, tick, render } = {}) => Identity.New({
	$world,

	tiles,
	entities,
	portals,

	tick,
	render,
});

export default {
	State: WorldMap,
	Reducers,
};