import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({

});

export const Realm = ({ $game, worlds = {}, tick, render } = {}) => Identity.New({
	$game,

	worlds,

	tick,
	render,
});

export default {
	State: Realm,
	Reducers,
};