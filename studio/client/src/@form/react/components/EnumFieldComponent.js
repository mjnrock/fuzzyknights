import { EnumFieldType } from "../../EnumFieldType.js";

import { FieldSection } from "./fields/FieldSection.jsx";
import { FieldInput } from "./fields/FieldInput.jsx";

export const EnumFieldComponent = {
	[ EnumFieldType.SECTION ]: FieldSection,

	[ EnumFieldType.ANY ]: FieldInput,
	[ EnumFieldType.TEXT ]: FieldInput,
	[ EnumFieldType.NUMBER ]: FieldInput,
};

export default EnumFieldComponent;