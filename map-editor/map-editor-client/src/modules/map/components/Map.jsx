import React from "react";
import { EnumActions } from "../main.js";
import { useModule } from "../../../lib/ReactModule.js";

import { TerrainCanvas } from "./TerrainCanvas.jsx";

export function Map({ module, textures, ...props }) {
	const { dispatch } = useModule(module);

	return (
		<div className="flex flex-row items-center justify-center p-2 m-2 border border-solid rounded bg-neutral-50 border-neutral-200" { ...props }>
			<div className="flex flex-col">
				<div className="flex flex-row gap-2">
					<div
						className="flex-1 p-2 mb-2 text-center text-white bg-gray-500 rounded cursor-pointer"
						onClick={ () => dispatch({ type: EnumActions.RANDOMIZE, module }) }
					>
						Randomize Seed
					</div>
					<div
						className="flex-1 p-2 mb-2 text-center text-white bg-gray-500 rounded cursor-pointer"
						onClick={ () => dispatch({
							type: EnumActions.SOLID_FILL,
							module,
							data: module.$query("texture", [ "selected" ]),
						}) }
					>
						Solid Fill
					</div>
				</div>

				<div className="m-auto">
					<TerrainCanvas
						className="cursor-crosshair"
						module={ module }
						textures={ textures }
						tiles={ 64 }
					/>
				</div>
			</div>
		</div>
	);
};

export default Map;