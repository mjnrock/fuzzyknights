import { Field } from "./Field.jsx";
import React from "react";

export function Form({ renderSection, renderField, form, dispatch }) {
	return (
		<>
			{ form?.schema?.state?.map((field) => (
				<Field
					key={ field.id }
					field={ field }
					ctx={{
						form,
						dispatch,
						renderField,
						renderSection,
					}}
				/>
			)) }
		</>
	);
};

export default Form;