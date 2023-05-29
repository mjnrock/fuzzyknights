import React from "react";
import { MapModuleReact, EnumActions } from "../main.js";

import { Canvas } from "./Canvas.jsx";

export function Map({ textures, ...props }) {
	const { dispatch, network } = MapModuleReact.useModule();

	return (
		<div className="flex flex-row items-center justify-center p-2 m-2 border border-solid rounded bg-neutral-50 border-neutral-200" { ...props }>
			<div className="flex flex-col">
				<div className="flex flex-row gap-2">
					<div
						className="flex-1 p-2 mb-2 text-center text-white bg-gray-500 rounded cursor-pointer"
						onClick={ () => dispatch({ type: EnumActions.RANDOMIZE }) }
					>
						Randomize Seed
					</div>
					<div
						className="flex-1 p-2 mb-2 text-center text-white bg-gray-500 rounded cursor-pointer"
						onClick={ () => dispatch({
							type: EnumActions.SOLID_FILL,
							data: network.execute("terrain", "state", [ "selected" ]),
						}) }
					>
						Solid Fill
					</div>
				</div>

				<Canvas textures={ textures } />
			</div>
		</div>
	);
};

export default Map;