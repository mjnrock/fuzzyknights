import { EnumFieldComponent } from "./EnumFieldComponent.js"

export function Field({ field, ctx, ...props }) {
	const { renderSection, renderField, state, lookup, update, validate, submit } = ctx;
	const Component = EnumFieldComponent[ field.type ];

	if(!Component) {
		return null;
	}

	if(field.type === EnumFieldComponent.SECTION) {
		return renderSection({ field, ctx, ...props });
	}

	return renderField({ field, value: state[ field.name ], ctx, jsx: Component, ...props });
};

export default Field;