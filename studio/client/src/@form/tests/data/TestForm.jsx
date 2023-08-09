import { useForm } from "../@form/react/useForm";

import TestSchema from "../@form/tests/data/TestForm";

const schema = TestSchema({});
export function TestForm() {
	const { state, lookup, update, validate, submit } = useForm(schema, {
		onUpdate: next => console.log("NEXT", next),
		onValidate: (name, isValid) => console.log("VALIDATE", name, isValid),
		onSubmit: (isValid, data) => console.log("SUBMIT", isValid, data),
	});

	console.warn(state);
	console.warn(lookup);

	return (
		<div>
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