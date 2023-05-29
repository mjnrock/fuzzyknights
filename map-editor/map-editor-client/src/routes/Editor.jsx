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
			{ ({ state, dispatch }) => (
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
			) }
		</MapModuleReact.RenderProps>
	)
};

export function Editor() {
	return (
		<>
			<MapModuleReact.Provider>
				<Test />
			</MapModuleReact.Provider>
			<Test2 />
		</>
	);
	// return (
	// 	<MapModuleRenderProps>
	// 		{ ({ state, dispatch }) => (
	// 			<>
	// 				<div
	// 					className="p-2 border border-solid border-gray-800 rounded cursor-pointer"
	// 					onClick={ () => dispatch({ type: "test" }) }
	// 				>
	// 					Click me
	// 				</div>

	// 				<div className="text-3xl font-bold underline">
	// 					{
	// 						JSON.stringify(state)
	// 					}
	// 				</div>
	// 			</>
	// 		) }
	// 	</MapModuleRenderProps>
	// );
};

export default Editor;