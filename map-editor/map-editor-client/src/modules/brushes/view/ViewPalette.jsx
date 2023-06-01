import { EnumActions } from "../main.js";

export function Button({ text, children, ...props } = {}) {
	return (
		<div
			className="p-2 m-2 text-white bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600"
			{ ...props }
		>
			{ text || children }
		</div>
	)
}

export function ViewPalette({ module }) {
	return (
		<>
			<Button
				onClick={ () => module.dispatch({ type: EnumActions.POINT }) }
				text="Point"
			/>
			<Button
				onClick={ () => module.dispatch({ type: EnumActions.PLUS }) }
				text="Plus"
			/>
		</>
	);
};

export default ViewPalette;