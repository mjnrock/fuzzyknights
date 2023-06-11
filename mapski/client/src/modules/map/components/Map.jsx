import React from "react";
import { EnumActions } from "../main.js";
import { useModule } from "../../../lib/ReactModule.js";

import { TerrainCanvas } from "./TerrainCanvas.jsx";

import { BsDice5, BsPaintBucket, BsEasel, BsBoundingBoxCircles } from "react-icons/bs";

export function Map({ module, textures, ...props }) {
	const { dispatch } = useModule(module);

	return (
		<div className="flex flex-row items-center justify-center p-2 m-2 border border-solid rounded bg-neutral-50 border-neutral-200" { ...props }>
			<div className="flex flex-col">
				<div className="flex flex-row gap-2">
					<BsEasel className="m-auto text-2xl text-gray-400" />
					<div className="flex flex-row flex-1 p-2 mb-2 text-center">
						<input
							type="number"
							className="w-full p-2 text-center border border-gray-300 border-solid rounded"
							value={ module.state.columns }
							onChange={ (e) => dispatch({
								type: EnumActions.RESIZE,
								data: [ +e.target.value, module.state.rows ],
							}) }
						/>
						<div className="m-auto text-gray-400">&nbsp;x&nbsp;</div>
						<input
							type="number"
							className="w-full p-2 text-center border border-gray-300 border-solid rounded"
							value={ module.state.rows }
							onChange={ (e) => dispatch({
								type: EnumActions.RESIZE,
								data: [ module.state.columns, +e.target.value ],
							}) }
						/>
					</div>
				</div>

				<div className="flex flex-row gap-2">
					<BsBoundingBoxCircles className="m-auto text-2xl text-gray-400" />
					<div className="flex flex-row flex-1 p-2 mb-2 text-center">
						<input
							type="number"
							className="w-full p-2 text-center border border-gray-300 border-solid rounded"
							value={ module.state.tw }
							onChange={ (e) => dispatch({
								type: EnumActions.RESIZE_TILES,
								data: [ +e.target.value, module.state.th ],
							}) }
						/>
						<div className="m-auto text-gray-400">&nbsp;x&nbsp;</div>
						<input
							type="number"
							className="w-full p-2 text-center border border-gray-300 border-solid rounded"
							value={ module.state.th }
							onChange={ (e) => dispatch({
								type: EnumActions.RESIZE_TILES,
								data: [ module.state.tw, +e.target.value ],
							}) }
						/>
					</div>
				</div>

				<div className="flex flex-row gap-2">
					<div
						className="flex-1 p-2 mb-2 text-center text-gray-400 border border-gray-300 border-solid rounded cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ () => dispatch({ type: EnumActions.RANDOMIZE }) }
					>
						<BsDice5 className="mx-auto text-2xl" />
					</div>
					<div
						className="flex-1 p-2 mb-2 text-center text-gray-400 border border-gray-300 border-solid rounded cursor-pointer bg-neutral-50 hover:bg-gray-400 hover:text-neutral-100 active:bg-gray-500"
						onClick={ () => dispatch({
							type: EnumActions.SOLID_FILL,
							data: module.$query("texture", [ "selected" ]),
						}) }
					>
						<BsPaintBucket className="mx-auto text-2xl" />
					</div>
				</div>

				<div className="m-auto">
					<TerrainCanvas
						className="cursor-crosshair"
						module={ module }
						textures={ textures }
					/>
				</div>
			</div>
		</div>
	);
};

export default Map;