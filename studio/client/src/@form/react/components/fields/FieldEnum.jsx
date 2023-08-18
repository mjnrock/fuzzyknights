export function FieldEnum({ field, value, ctx, ...props }) {
	const { dispatch } = ctx;
	const { id, type, name } = field;
	const { options } = field?.meta ?? [];

	return (
		<select
			className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
			defaultValue={ field.type }
			onChange={ e => {
				dispatch({ type: "updateFieldValues", data: [ name, e.target.value ] });
			} }
		>
			{
				options.map((value) => (
					<option
						key={ value }
						value={ value }
					>{ value }</option>
				))
			}
		</select>
	)
};

export default FieldEnum;