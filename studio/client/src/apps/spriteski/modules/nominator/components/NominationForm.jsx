import { useCallback, useEffect } from "react";
import { useForm } from "../../../../../@form/react/useForm.js";
import { EnumFieldType } from "../../../../../@form/EnumFieldType.js";
import { Form } from "../../../../../@form/react/components/Form.jsx";
import { Field } from "../../../../../@form/react/components/Field.jsx";
import { debounce } from "../../../../../util/debounce.js";

const CulledEnumFieldType = {
	TEXT: EnumFieldType.TEXT,
	NUMBER: EnumFieldType.NUMBER,
	// ENUM: EnumFieldType.ENUM,
	FUNCTION: EnumFieldType.FUNCTION,
};

export function NominationForm({ data, update }) {
	const { nominatorData } = data;
	const { nominatorDispatch } = update;

	return (
		<>
			<Form
				form={ nominatorData?.form }
				dispatch={ nominatorDispatch }
				renderField={ ({ children, field, value, ctx, jsx: Component, ...props }) => {
					const { dispatch } = ctx;

					if(field?.meta?.isConfigurable === false) {
						return (
							<div className="flex flex-col gap-2 m-2">
								<div>{ field.meta.label }</div>
								<div
									key={ field.id }
									className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
								>
									{ field.state.toString() }
								</div>
							</div>
						);
					}

					return (
						<div className="flex flex-col gap-2 m-2">
							<div>{ field.meta.label }</div>

							<select
								className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
								defaultValue={ field.type }
								onChange={ e => {
									nominatorDispatch({ type: "updateFieldType", data: { id: field.id, type: e.target.value } });
								} }
							>
								{
									Object.entries(CulledEnumFieldType).map(([ key, value ]) => (
										<option
											key={ key }
											value={ value }
										>{ key }</option>
									))
								}
							</select>

							<Component
								key={ field.id }
								className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
								field={ field }
								value={ value ?? field.state ?? "" }
								ctx={ {
									...ctx,
									dispatch: debounce(dispatch, 50),	// Throttle updates to 350ms
									// jsxMap: ({
									// 	enum: () => (<div>ENUM</div>),
									// }),
								} }
								{ ...props }
							/>
						</div>
					);
				} }
				renderSection={ ({ children, field, ctx, ...props }) => {
					return (
						<div className="flex flex-col gap-2 m-2">
							{ field?.state?.map((field) => (
								<Field
									key={ field.id }
									field={ field }
									ctx={ ctx }
									{ ...props }
								/>
							)) }
						</div>
					);
				} }
			/>
		</>
	);
};

export default NominationForm;