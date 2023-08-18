export function FieldInput({ field, value, ctx, ...props }) {
	const { dispatch } = ctx;
	const { id, type, name } = field;

	return (
		<input
			id={ id }
			name={ name }
			type={ type }
			value={ value }
			onChange={ type === "number" ?
				e => dispatch({ type: "updateFieldValues", data: [ name, +e.target.value ] })
				: e => dispatch({ type: "updateFieldValues", data: [ name, e.target.value ] })
			}
			{ ...field?.html }
			{ ...props }
		/>
	);
};

export default FieldInput;