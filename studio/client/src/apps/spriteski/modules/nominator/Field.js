import { v4 as uuid } from "uuid";
import { EnumFieldType } from "../../../../@form/EnumFieldType";


export const Selectors = {
	getName: (state) => state.name,
	getLabel: (state) => state.meta.label,
	getState: (state) => state.state,
	getMeta: (state) => state.meta,
	getType: (state) => state.type,
};

export const State = ({ id, type = EnumFieldType.ANY, ...args }) => ({
	id: id ?? uuid(),
	name: null,
	type,
	state: null,
	meta: {},
	...args,
});

export const Reducers = ({ }) => ({
	set(state, next = {}) {
		return State(next);
	},
	merge(state, next = {}) {
		return State({
			...state,
			...next,
		});
	},
	transform(state, type) {
		return State({
			id: state.id,
			name: state.name,
			type,
			state: null,
		});
	},

	setName: (state, name) => ({ ...state, name }),
	setLabel: (state, label) => ({ ...state, meta: { ...state.meta, label } }),
	setState: (state, stateValue) => ({ ...state, state: stateValue }),
	setMeta: (state, meta = {}) => ({ ...state, meta }),

	changeType: (state, type) => {
		if(state.type === type) return state;

		const next = { ...state, type };

		return next;
	},
});

export default {
	State,
	Reducers,
	Selectors,
};