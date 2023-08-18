import { EnumFieldType } from "../../EnumFieldType.js";
import { EnumFieldComponent } from "./EnumFieldComponent.js"

export function Field({ field, ctx, ...props }) {
	const { renderSection, renderField, jsxMap, form } = ctx;
	const Component = jsxMap?.[ field?.type ] ?? EnumFieldComponent[ field?.type ];

	if(!Component) {
		return null;
	}

	if(field.type === EnumFieldType.SECTION) {
		return renderSection({ field, ctx, ...props });
	}

	return renderField({ field, value: form?.data?.[ field.name ], ctx, jsx: Component, ...props });
};

export default Field;