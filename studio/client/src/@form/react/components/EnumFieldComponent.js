import { EnumFieldType } from "../../EnumFieldType.js";

import { FieldSection } from "./fields/FieldSection.jsx";
import { FieldInput } from "./fields/FieldInput.jsx";
import { FieldEnum } from "./fields/FieldEnum.jsx";
import { FieldFunction } from "./fields/FieldFunction.jsx";

export const EnumFieldComponent = {
	[ EnumFieldType.SECTION ]: FieldSection,

	[ EnumFieldType.ANY ]: FieldInput,
	[ EnumFieldType.TEXT ]: FieldInput,
	[ EnumFieldType.NUMBER ]: FieldInput,

	[ EnumFieldType.ENUM ]: FieldEnum,
	[ EnumFieldType.FUNCTION ]: FieldFunction,
};

export default EnumFieldComponent;