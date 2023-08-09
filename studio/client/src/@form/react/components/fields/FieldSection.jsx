import { EnumFieldType } from "../../../EnumFieldType.js";

import { Field } from "../Field.jsx";

export function FieldSection({ field, ...form }) {
	if(field.type !== EnumFieldType.SECTION) {
		return null;
	}

	const { state, lookup, update, validate, submit } = form;

	return (
		<div className="flex flex-col gap-2 m-2">
			{ field.state.map((field) => (
				<div className="flex flex-row p-2 border border-solid rounded border-neutral-200" key={ field.id }>
					{
						field.type === EnumFieldType.SECTION ? (
							<FieldSection
								key={ field.id }
								field={ field }
								{ ...form }
							/>
						) : (
							<Field
								key={ field.id }
								field={ field }
								{ ...form }
							/>
						)
					}
				</div>
			)) }
		</div>
	);
};

export default FieldSection;