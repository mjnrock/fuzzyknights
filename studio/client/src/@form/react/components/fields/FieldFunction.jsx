import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { indentUnit } from "@codemirror/language";

export function FieldFunction({ field, value, ctx, ...props }) {
	const { lookup, update, validate, submit } = ctx;
	const { id, type, name } = field;

	return (
		<CodeMirror
			extensions={ [
				javascript({ jsx: true }),
				indentUnit.of("    "),
			] }
			style={ { maxHeight: '200px', overflowY: 'auto' } }
			value={ value }
			onChange={ (value, viewUpdate) => {
				console.log("value:", value, viewUpdate);
				update(name, value);
			} }
			{ ...props }
		/>
	);
};

export default FieldFunction;