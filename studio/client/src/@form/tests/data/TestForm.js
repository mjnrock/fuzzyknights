import { v4 as uuid } from "uuid";
import { EnumFieldType } from "../../EnumFieldType";

export const TestForm = ({ ...args } = {}) => ({
	id: uuid(),
	type: EnumFieldType.FORM,
	name: "@root",
	meta: {
		label: "Test Form",
	},
	state: [
		{
			id: uuid(),
			type: EnumFieldType.SECTION,
			name: "@section",
			meta: {
				label: "Section 1",
				isVirtual: false,
			},
			state: [
				{
					id: uuid(),
					type: EnumFieldType.TEXT,
					name: "text1",
					meta: {
						label: "Text 1",
					},
					state: null,
					validation: {
						validator: value => typeof value === "string" && value.length > 0,
					},
				},
				{
					id: uuid(),
					type: EnumFieldType.NUMBER,
					name: "number1",
					meta: {
						label: "Number 1",
					},
					state: null,
				},
				{
					id: uuid(),
					type: EnumFieldType.ENUM,
					name: "enum1",
					meta: {
						label: "Enum 1",
						options: [
							"ENUM_1",
							"ENUM_2",
							"ENUM_3",
						],
					},
					state: null,
				},
			],
		},
	],

	...args,
});

export default TestForm;