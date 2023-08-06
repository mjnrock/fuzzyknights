import Identity from "../@node/Identity";

export const Reducers = ({ $game } = {}) => ({
	setType: (state, type) => ({ ...state, type }),
	setState: (state, state) => ({ ...state, state }),
});

export const EnumPaneType = {
	CAMERA: "camera",
	PANE: "pane",
	JSX: "jsx",
};

export const Pane = ({ type, state = {} } = {}) => Identity.New({
	type,
	state,
});

export default {
	State: Pane,
	Reducers,
};