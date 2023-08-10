import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import EnumFieldType from "../EnumFieldType";

export function useForm(schema, { onUpdate, onValidate, onSubmit } = {}) {
	const [ lookup, setLookup ] = useState({
		$id: uuid(),
	});
	const [ state, setState ] = useState({
		$id: uuid(),
	});

	useEffect(() => {
		const nextRepo = {};
		const recurser = (field, data = {}) => {
			nextRepo[ field.id ] = field;
			nextRepo[ field.name ] = field.id;

			if(field.type === EnumFieldType.FORM || field.type === EnumFieldType.SECTION) {
				for(const subField of field.state) {
					recurser(subField, data);
				}
			} else {
				data[ field.name ] = field.state;
			}

			return data;
		};

		const next = recurser(schema);

		setState(next);
		setLookup(nextRepo);
	}, [ schema ]);

	const update = (name, value) => {
		if(!(name in state)) {
			console.warn(`Field ${ name } does not exist.`);
			return;
		}

		if(validate(name, value) === false) {
			return;
		}

		const next = {
			...state,
			[ name ]: value,
		};

		setState(next);

		if(onUpdate) {
			onUpdate(next);
		}
	};

	const validate = (name, value) => {
		if(!(name in state)) {
			console.warn(`Field ${ name } does not exist.`);
			return;
		}

		let id = lookup[ name ];
		const field = lookup[ id ];

		let isValid = true;
		if(field.validation) {
			const { required, validator, regex, min, max } = field.validation;

			if(validator) {
				isValid = validator(value);
			} else if(regex) {
				isValid = new RegExp(regex).test(value);
			} else if(min || max) {
				isValid = (min && value >= min) && (max && value <= max);
			} else if(required) {
				isValid = !!value;
			}
		}

		if(onValidate) {
			onValidate(name, isValid);
		}

		return isValid;
	};

	const submit = () => {
		const next = { ...state };

		if(onSubmit) {
			onSubmit(next);
		}
	};

	return {
		id: schema.id,
		state,
		setState,
		lookup,

		update,
		validate,
		submit,
	};
};

export default useForm;