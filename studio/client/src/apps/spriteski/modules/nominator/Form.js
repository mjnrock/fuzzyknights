import { v4 as uuid } from "uuid";
import { EnumFieldType } from "../../../../@form/EnumFieldType";

export const Helpers = {
	findField: (form, fieldId) => {
		const findField = (state) => {
			if(!state) return null;

			const field = state.find((s) => s.id === fieldId);

			if(field) return field;

			for(const section of state) {
				const field = findField(section.state);

				if(field) return field;

				continue;
			}

			return null;
		};

		return findField(form.state);
	},
	findSection: (form, sectionId) => {
		const section = form.state.find((s) => s.id === sectionId);

		if(!section) return null;

		return section;
	},
};

export const Selectors = {
	getName: (form) => form.name,
	getLabel: (form) => form.meta.label,
	getMeta: (form) => form.meta,
	getState: (form) => form.state,
	getField: (form, fieldId) => {
		return Helpers.findField(form, fieldId);
	},
	getFieldState: (form, fieldId) => {
		const field = Helpers.findField(form, fieldId);

		if(!field) return null;

		return field.state;
	}
};

export const Templates = {
	SimpleForm: ({ label, fields, ...args } = {}) => ({
		id: uuid(),
		type: EnumFieldType.FORM,
		name: "@form",
		meta: {
			label,
		},
		state: [
			{
				id: uuid(),
				type: EnumFieldType.SECTION,
				name: "@section",
				meta: {
					isVirtual: true,
				},
				state: fields,
			},
		],
		...args,
	}),
};

export const State = ({ name, label, state = [], ...args } = {}) => ({
	id: uuid(),
	type: EnumFieldType.FORM,
	name,
	meta: {
		label,
	},
	state,
	...args,
});

export const Reducers = ({ } = {}) => ({
	setName: (form, name) => ({ ...form, name }),
	setLabel: (form, label) => ({ ...form, meta: { ...form.meta, label } }),
	setMeta: (form, meta = {}) => ({ ...form, meta }),
	setState: (form, state) => ({ ...form, state }),
	setSectionState: (form, sectionId, state) => {
		const next = { ...form };
		const section = next.state.find((s) => s.id === sectionId);

		if(!section) return next;

		section.state = state;

		return next;
	},
	setFieldState: (form, fieldId, state) => {
		const next = { ...form };
		const findField = (state) => {
			if(!state) return null;

			const field = state.find((s) => s.id === fieldId);

			if(field) return field;

			for(const section of state) {
				const field = findField(section.state);

				if(field) return field;

				continue;
			}

			return null;
		};

		const field = findField(next.state);

		if(!field) return next;

		field.state = state;

		return next;
	},
});

export default {
	State,
	Reducers,
	Helpers,
	Selectors,
	Templates,
};