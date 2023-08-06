import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({
	setPane: (state, pane) => ({ ...state, pane }),
});

export const ViewPort = ({ pane } = {}) => Identity.New({
	pane,
});

export default {
	State: ViewPort,
	Reducers,
};