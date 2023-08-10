import { EnumFieldType } from "../../EnumFieldType.js";

import { FieldSection } from "./fields/FieldSection.jsx";
import { FieldInput } from "./fields/FieldInput.jsx";
import { FieldEnum } from "./fields/FieldEnum.jsx";

export const EnumFieldComponent = {
	[ EnumFieldType.SECTION ]: FieldSection,

	[ EnumFieldType.ANY ]: FieldInput,
	[ EnumFieldType.TEXT ]: FieldInput,
	[ EnumFieldType.NUMBER ]: FieldInput,

	[ EnumFieldType.ENUM ]: FieldEnum,
};

export default EnumFieldComponent;