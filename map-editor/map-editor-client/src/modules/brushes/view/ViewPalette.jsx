import { useState } from "react";

import { BsPen, BsPlus, BsSquare, BsEraser } from "react-icons/bs";
import { EnumActions } from "../main.js";

export function Button({ text, active, children, ...props } = {}) {
	return (
		<div className={ `p-2 text-blue-300 border border-blue-200 border-solid rounded shadow cursor-pointer ${ active ? "bg-blue-300 text-neutral-100" : "bg-neutral-50" } hover:bg-blue-500 hover:text-neutral-300` } { ...props }>
			{ text || children }
		</div>
	)
}

export function ViewPalette({ module }) {
	const [ active, setActive ] = useState(module.state.brush);

	const dispatch = (type, data) => () => {
		module.dispatch({ type, data });
		setActive(type);
	};

	return (
		<div className="flex flex-row gap-2 mt-2">
			<Button onClick={ dispatch(EnumActions.ERASER) } active={ active === EnumActions.ERASER }>
				<BsEraser className="text-2xl" />
			</Button>
			<Button onClick={ dispatch(EnumActions.POINT) } active={ active === EnumActions.POINT }>
				<BsPen className="text-2xl" />
			</Button>
			<Button onClick={ dispatch(EnumActions.PLUS) } active={ active === EnumActions.PLUS }>
				<BsPlus className="text-2xl" />
			</Button>
			<Button onClick={ dispatch(EnumActions.RECTANGLE, { width: 6, height: 3 }) } active={ active === EnumActions.RECTANGLE }>
				<BsSquare className="text-2xl" />
			</Button>
		</div>
	);
};

export default ViewPalette;