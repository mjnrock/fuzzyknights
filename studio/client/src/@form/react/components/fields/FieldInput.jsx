export function FieldInput({ field, value, ctx, ...props }) {
	const { lookup, update, validate, submit } = ctx;
	const { id, type, name } = field;

	return (
		<input
			id={ id }
			name={ name }
			type={ type }
			value={ value }
			onChange={ e => {
				update(name, e.target.value);
			} }
			{ ...field?.html }
			{ ...props }
		/>
	);
};

export default FieldInput;