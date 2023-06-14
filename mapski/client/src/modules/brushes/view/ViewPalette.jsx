import { useState } from "react";
import { useModule } from "../../../lib/ReactModule.js";

import { BsPen, BsPlus, BsSquare, BsDice5, BsPaintBucket } from "react-icons/bs";
import { EnumActions } from "../main.js";
import { EnumActions as EnumMapActions } from "../../map/main.js";

export function Button({ text, active, children, ...props } = {}) {
	return (
		<div className={ `p-2 text-blue-300 border border-blue-200 border-solid rounded shadow cursor-pointer ${ active ? "bg-blue-300 text-neutral-100" : "bg-neutral-50" } hover:bg-blue-500 hover:text-neutral-300` } { ...props }>
			{ text || children }
		</div>
	)
}

export function ViewPalette({ module }) {
	useModule(module);
	const [ active, setActive ] = useState(module.state.brush);

	const dispatch = (type, data) => () => {
		module.dispatch({ type, data });
		setActive(type);
	};
	const $dispatch = (name, type, data) => () => {
		module.$dispatch(name, { type, data });
		setActive(type);
	};

	return (
		<div className="flex flex-row items-center justify-center gap-2">
			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded bg-gray-50 border-neutral-200">
				<div className="flex flex-row gap-2">
					<div
						className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ $dispatch("map", EnumMapActions.RANDOMIZE) }
					>
						<BsDice5 className="mx-auto text-2xl" />
					</div>
					<div
						className="flex-1 p-2 text-center text-gray-400 border border-gray-300 border-solid rounded shadow cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ $dispatch("map", EnumMapActions.SOLID_FILL, module.$query("terrain", "selected")) }
					>
						<BsPaintBucket className="mx-auto text-2xl" />
					</div>
				</div>
			</div>

			<div className="flex flex-row items-center justify-center gap-2 p-2 border border-solid rounded bg-blue-50 border-neutral-200">
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
		</div>
	);
};

export default ViewPalette;