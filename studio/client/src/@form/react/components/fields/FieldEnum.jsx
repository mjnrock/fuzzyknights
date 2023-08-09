import { Listbox } from "@headlessui/react";

export function FieldEnum({ field, ctx, ...props }) {
	const { state, lookup, update, validate, submit } = ctx;
	const { id, type, name, meta: { options } } = field;

	const value = state[ name ];

	return (
		<Listbox
			value={ value }
			onChange={ next => update(name, next) }
		>
			<Listbox.Button
				className={ `bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm` }
			>
				{ value }
			</Listbox.Button>

			<Listbox.Options>
				{ options.map((option) => (
					<Listbox.Option
						key={ option }
						className={ ({ active }) => `${ active ? 'text-white bg-blue-600' : 'text-gray-900' } cursor-default select-none relative py-2 pl-10 pr-4` }
						value={ option }
					>
						{ option }
					</Listbox.Option>
				)) }
			</Listbox.Options>
		</Listbox>
	)
};

export default FieldEnum;