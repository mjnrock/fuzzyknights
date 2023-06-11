import React from "react";
import { MapModuleReact } from "../modules/map/main";

export function Test() {
	const { state, dispatch } = MapModuleReact.useModule();

	return (
		<>
			<div
				className="p-2 border border-solid border-gray-800 rounded cursor-pointer"
				onClick={ () => dispatch({ type: "test" }) }
			>
				Click me
			</div>

			<div className="text-3xl font-bold underline">
				{
					JSON.stringify(state)
				}
			</div>
		</>
	)
};
export function Test2() {
	return (
		<MapModuleReact.RenderProps>
			{ ({ state, dispatch, emit }) => (
				<>
					<div
						className="p-2 border border-solid border-gray-800 rounded cursor-pointer"
						onClick={ () => dispatch({ type: "test" }) }
					>
						Click me
					</div>
					<div
						className="p-2 border border-solid border-gray-800 rounded cursor-pointer"
						onClick={ () => emit("test") }
					>
						Test Emit
					</div>

					<div className="text-3xl font-bold underline">
						{
							JSON.stringify(state)
						}
					</div>
				</>
			) }
		</MapModuleReact.RenderProps>
	)
};
export function Test3() {
	const [ now, setNow ] = React.useState(Date.now());
	MapModuleReact.useEventWatcher("test", () => {
		setNow(Date.now());
	});

	return (
		<div>
			{ now }
		</div>
	)
};

export function Default() {
	return (
		<>
			<MapModuleReact.Provider>
				<Test />
			</MapModuleReact.Provider>
			<Test2 />
			<Test3 />
		</>
	);
};

export default Default;