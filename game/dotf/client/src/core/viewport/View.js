import Identity from "../../@node/Identity";
import Observer from "./Observer";
import Pane from "./Pane";

export const Reducers = ({ $game } = {}) => ({
	setObserver: (state, observer) => ({ ...state, observer }),
	setPanes: (state, panes) => ({ ...state, panes: panes.map(pane => Pane.State(pane)) }),
	setAsView: (state, pane) => ({ ...state, panes: [ Pane.State(pane) ] }),
});
export const View = ({ observer, panes = [], ...args } = {}) => Identity.Identity.Next({
	observer: Observer.State(observer),
	panes: [
		panes.map(pane => Pane.State(pane)),
	],
	...args,
});

export default {
	Reducers,
	State: View,
};