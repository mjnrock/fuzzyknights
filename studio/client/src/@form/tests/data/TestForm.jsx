import { useForm } from "../@form/react/useForm";
import TestSchema from "../@form/tests/data/TestForm";

import { Form } from "../@form/react/components/Form.jsx";
import { Field } from "../@form/react/components/Field.jsx";

import { debounce } from "../util/debounce.js";

const schema = TestSchema({});
export function TestForm() {
	const form = useForm(schema, {
		onUpdate: next => console.log("NEXT", next),
		onValidate: (name, isValid) => console.log("VALIDATE", name, isValid),
		onSubmit: (isValid, data) => console.log("SUBMIT", isValid, data),
	});
	const { id: formId, state, lookup, update, validate, submit } = form;

	console.warn(state);
	console.warn(lookup);

	return (
		<div>
			<h1>Spriteski</h1>

			<div className="flex flex-col gap-2 m-2">
				<Form
					form={ form }
					renderField={ ({ children, field, value, ctx, jsx: Component, ...props }) => {
						const { state, lookup, update, validate, submit } = ctx;

						return (
							<Component
								key={ field.id }
								field={ field }
								ctx={ {
									...ctx,
									update: debounce(update, 250),	// Throttle updates to 350ms
									// jsxMap: ({
									// 	enum: () => (<div>ENUM</div>),
									// }),
								} }
								{ ...props }
							/>
						);
					} }
					renderSection={ ({ children, field, ctx, ...props }) => {
						const { state, lookup, update, validate, submit } = ctx;

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
			</div>

			<button
				className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
				onClick={ e => {
					update("text1", "meow");
				} }
			>
				Update
			</button>

			<pre>
				{
					JSON.stringify(state, null, 2)
				}
			</pre>
		</div>
	);
};

export default TestForm;