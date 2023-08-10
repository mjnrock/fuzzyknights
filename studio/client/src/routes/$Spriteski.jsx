import { v4 as uuid } from "uuid";
import React, { useEffect, useRef } from "react";
import { useForm } from "../@form/react/useForm";
import { EnumFieldType } from "../@form/EnumFieldType.js";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

import { Form } from "../@form/react/components/Form.jsx";
import { Field } from "../@form/react/components/Field.jsx";

import { debounce } from "../util/debounce.js";

const CulledEnumFieldType = {
	TEXT: EnumFieldType.TEXT,
	NUMBER: EnumFieldType.NUMBER,
	ENUM: EnumFieldType.ENUM,
	FUNCTION: "function",
};

export function Spriteski() {
	const [ phrase, setPhrase ] = React.useState([]);
	const [ pattern, setPattern ] = React.useState([]);
	const [ fields, setFields ] = React.useState([]);

	const calcPattern = React.useCallback(debounce(value => {
		// split the pattern-phrase into an array of words
		const next = [];
		const values = value.split("-");
		for(let i = 0; i < values.length; i++) {
			const word = values[ i ].trim();
			if(word.startsWith("{") && word.endsWith("}")) {
				const variable = word.slice(1, -1).trim();

				next.push(`@${ variable }`);
			} else {
				next.push(word);
			}
		}

		setPattern(next);
		setPhrase(value);
	}, 0), []);

	useEffect(() => {
		// use the pattern array to create a Field array
		const next = [];
		for(let word of pattern) {
			if(word.startsWith("@")) {
				let name = word.slice(1);

				if(name.startsWith("$")) {
					word = name;
				}

				next.push({
					id: uuid(),
					type: EnumFieldType.TEXT,
					name: word,
					meta: {
						label: name,
						isConfigurable: true,
					},
					state: null,
				});
			} else {
				next.push({
					id: uuid(),
					type: EnumFieldType.TEXT,
					name: word,
					meta: {
						label: word,
						isConfigurable: false,
					},
					state: word,
				});
			}
		}

		const schema = {
			id: uuid(),
			type: EnumFieldType.FORM,
			name: "@root",
			meta: {
				label: "Test Form",
			},
			state: [
				{
					id: uuid(),
					type: EnumFieldType.SECTION,
					name: "@section",
					meta: {
						label: "Section 1",
						isVirtual: false,
					},
					state: next,
				},
			],
		};

		setFields(schema);
	}, [ pattern ]);

	const updateFieldType = React.useCallback((name, type) => {
		const next = [];
		const section = fields.state[ 0 ].state;
		for(let field of section) {
			if(field.name === name) {
				next.push({
					...field,
					type,
				});
			} else {
				next.push(field);
			}
		}

		setFields({
			...fields,
			state: [
				{
					...fields.state[ 0 ],
					state: next,
				},
			],
		});
	}, [ fields ]);

	const form = useForm(fields, {
		onUpdate: next => console.log("NEXT", next),
		onValidate: (name, isValid) => console.log("VALIDATE", name, isValid),
		onSubmit: (isValid, data) => console.log("SUBMIT", isValid, data),
	});
	const { id: formId, state, lookup, update, validate, submit } = form;

	const onCodeMirrorChange = React.useCallback((value, viewUpdate) => {
		console.log("value:", value, viewUpdate);
	}, []);
	return (
		<div>
			<h1>Spriteski</h1>
			<CodeMirror
				value="console.log('hello world!');"
				height="200px"
				extensions={ [ javascript({ jsx: true }) ] }
				onChange={ onCodeMirrorChange }
			/>

			<div className="flex flex-col gap-2 m-2">
				<div className="flex flex-col gap-2 m-2">
					<div className="text-lg font-bold">Naming Pattern</div>
					<input
						className="p-2 text-center border border-solid rounded border-neutral-200 hover:bg-neutral-50"
						type="text"
						value={ phrase }
						onChange={ e => calcPattern(e.target.value) }
					/>
				</div>
				<Form
					form={ form }
					renderField={ ({ children, field, value, ctx, jsx: Component, ...props }) => {
						const { state, lookup, update, validate, submit } = ctx;

						if(field?.meta?.isConfigurable === false) {
							return (
								<div className="flex flex-col gap-2 m-2">
									<div>{ field.meta.label }</div>
									<div
										key={ field.id }
										className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
									>
										{ field.state.toString() }
									</div>
								</div>
							);
						}

						return (
							<div className="flex flex-col gap-2 m-2">
								<div>{ field.meta.label }</div>
								<select
									className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
									onChange={ e => {
										updateFieldType(field.name, e.target.value);
									} }
								>
									{
										Object.entries(CulledEnumFieldType).map(([ key, value ]) => (
											<option key={ key } value={ value }>{ key }</option>
										))
									}
								</select>
								<Component
									key={ field.id }
									className="p-2 border border-solid rounded border-neutral-200 hover:bg-neutral-50"
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
							</div>
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

export default Spriteski;