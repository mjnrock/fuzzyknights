import { EnumFieldType } from "./EnumFieldType";

export const Field = {
	id: UUID,
	type: EnumFieldType,
	name: String,
	state: Any,

	meta: { /* Any meta data (e.g. dtype, ltype, label, etc.) */ },

	validation: {
		required: Boolean,
		validator: Function,
		regex: String,
		min: Number,
		max: Number,
	},

	html: {
		readOnly: Boolean,
		disabled: Boolean,
		hidden: Boolean,
		defaultValue: Any,
		placeholder: String,
		// ... any other HTML attributes
	},

	events: {
		// Actions
		update: Function,
		validate: Function,
		submit: Function,

		// Effects
		onUpdate: Function,
		onValidate: Function,
		onSubmit: Function,

		// HTML Events
		html: { /* Any HTML events */ },
	},
};
export const Section = {
	id: UUID,
	type: EnumFieldType.SECTION,
	name: String,
	state: [ Field ],

	meta: {
		/* Any meta data */
		isVirtual: Boolean,	// If true, this section is not rendered; but its children are
	},

	events: { /* See Field.events */ },
};
export const Form = {
	id: UUID,
	type: EnumFieldType.FORM,
	name: String,
	state: [ Field ],

	meta: { /* Any meta data */ },

	events: { /* See Field.events */ },
};

export default {
	Field,
	Section,
	Form,
	EnumFieldType,
};