import React from "react";
import { EnumActions } from "../main.js";
import { useModule } from "../../../lib/ReactModule.js";

import { BsEasel, BsBoundingBoxCircles } from "react-icons/bs";

export function MapDetail({ node, ...props }) {
	const { dispatch } = useModule(node);

	return (
		<div className="p-2 border border-solid rounded bg-neutral-50 border-neutral-200">
		<div className="flex flex-row gap-2 mb-1">
			<BsEasel className="m-auto text-2xl text-gray-400" />
			<div className="flex flex-row flex-1 text-center">
				<input
					type="number"
					className="w-full p-2 text-center border border-gray-300 border-solid rounded"
					value={ node.state.columns }
					onChange={ (e) => dispatch({
						type: EnumActions.RESIZE,
						data: [ +e.target.value, node.state.rows ],
					}) }
				/>
				<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
				<input
					type="number"
					className="w-full p-2 text-center border border-gray-300 border-solid rounded"
					value={ node.state.rows }
					onChange={ (e) => dispatch({
						type: EnumActions.RESIZE,
						data: [ node.state.columns, +e.target.value ],
					}) }
				/>
			</div>
		</div>
		
		<div className="flex flex-row gap-2 mb-1">
				<BsBoundingBoxCircles className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 text-center">
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ node.state.tw }
						onChange={ (e) => dispatch({
							type: EnumActions.RESIZE_TILES,
							data: [ +e.target.value, node.state.th ],
						}) }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ node.state.th }
						onChange={ (e) => dispatch({
							type: EnumActions.RESIZE_TILES,
							data: [ node.state.tw, +e.target.value ],
						}) }
					/>
				</div>
			</div>
		</div>
	);
};

export default MapDetail;