import { EnumFieldType } from "../../EnumFieldType.js";
import { EnumFieldComponent } from "./EnumFieldComponent.js"

export function Field({ field, ctx, ...props }) {
	const { renderSection, renderField, jsxMap, state, lookup, update, validate, submit } = ctx;
	const Component = jsxMap?.[ field?.type ] ?? EnumFieldComponent[ field?.type ];

	if(!Component) {
		return null;
	}

	if(field.type === EnumFieldType.SECTION) {
		return renderSection({ field, ctx, ...props });
	}

	return renderField({ field, value: state[ field.name ], ctx, jsx: Component, ...props });
};

export default Field;