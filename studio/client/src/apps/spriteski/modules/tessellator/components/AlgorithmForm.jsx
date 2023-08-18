import { useCallback, useEffect } from "react";
import { useForm } from "../../../../../@form/react/useForm.js";
import { EnumFieldType } from "../../../../../@form/EnumFieldType.js";
import { Form } from "../../../../../@form/react/components/Form.jsx";
import { Field } from "../../../../../@form/react/components/Field.jsx";
import { debounce } from "../../../../../util/debounce.js";

export function AlgorithmForm({ data, update }) {
	const { tessellatorData, nominatorData } = data;
	const { tessellatorDispatch, nominatorDispatch } = update;

	return (
		<>
			<Form
				form={ tessellatorData?.form }
				dispatch={ tessellatorDispatch }
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
							<Component
								key={ field.id }
								className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
								field={ field }
								value={ value ?? field.state ?? "" }
								ctx={ {
									...ctx,
									dispatch: debounce(dispatch, 25),
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

export default AlgorithmForm;