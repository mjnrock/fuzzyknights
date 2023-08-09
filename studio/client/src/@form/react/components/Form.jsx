import { Field } from "./Field.jsx";
import React from "react";

export function Form({ renderSection, renderField, form }) {
	const { state, lookup, update, validate, submit } = form;

	return (
		<>
			{ lookup?.[ form.id ]?.state?.map((field) => (
				<Field
					key={ field.id }
					field={ field }
					ctx={{
						...form,
						renderField,
						renderSection,
					}}
				/>
			)) }
		</>
	);
};

export default Form;