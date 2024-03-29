import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import EnumFieldType from "../EnumFieldType";

/**
 * This differs from `useForm` in that the form data only exists
 * within this hook.  As such, use when React alone is sufficient
 * to manage the form state (i.e. no external users)
 */
export function useForm(schema, sync, { onInit, onUpdate, onValidate, onSubmit } = {}) {
	const [ lookup, setLookup ] = useState({
		$id: uuid(),
	});
	const [ state, setState ] = useState(sync ?? {
		$id: uuid(),
	});

	useEffect(() => {
		setState(sync);

		if(onUpdate) {
			onUpdate(sync);
		}
	}, [ sync ]);

	useEffect(() => {
		if(!schema) return;
		if(!schema?.state?.[ 0 ]?.state) return;

		const nextRepo = {};
		const recurser = (field, data = {}) => {
			nextRepo[ field.id ] = field;
			nextRepo[ field.name ] = field.id;

			if(field.type === EnumFieldType.FORM || field.type === EnumFieldType.SECTION) {
				for(const subField of field.state) {
					recurser(subField, data);
				}
			} else {
				data[ field.name ] = state[ field.name ] ?? field.state;
			}

			return data;
		};

		const next = recurser(schema);

		setState(next);
		setLookup(nextRepo);

		if(onInit) {
			onInit(next, schema);
		}
	}, [ schema ]);

	const update = (name, value, suppress = false) => {
		let next = { ...state };
		if(Array.isArray(name)) {
			for(const field of name) {
				console.log(field)
				next[ field?.name ] = update(field?.name, field?.state, true);
			}
		} else if(typeof name === "object") {
			for(const [ key, value ] of Object.entries(name)) {
				next[ key ] = update(key, value, true);
			}
		} else {
			if(!(name in state)) {
				console.warn(`Field ${ name } does not exist.`);
				return;
			}

			if(validate(name, value) === false) {
				return;
			}

			next[ name ] = value;
		}

		setState(next);

		if(!suppress && onUpdate) {
			onUpdate(next);
		}

		return next;
	};

	const validate = (name, value) => {
		if(!(name in state)) {
			console.warn(`Field ${ name } does not exist.`);
			return;
		}

		let id = lookup[ name ];
		const field = lookup[ id ];

		let isValid = true;
		if(field?.validation) {
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
		id: schema?.id,
		state,
		setState,
		lookup,

		update,
		validate,
		submit,
	};
};

export default useForm;