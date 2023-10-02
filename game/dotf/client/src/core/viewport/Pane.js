import Identity from "../../@node/Identity";

export const Reducers = ({ $game } = {}) => ({
	merge: (state, pane) => ({ ...state, ...pane }),
});
export const Pane = ({ ...args } = {}) => Identity.Identity.Next({
	...args,
});

export default {
	Reducers,
	State: Pane,
};