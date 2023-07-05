import { useState } from "react";
import { BsEasel, BsBoundingBox, BsAspectRatio, BsGrid3X3, BsArrowsMove } from "react-icons/bs";

export function ResetToDefault({ update }) {
	const [ confirmDialogOpen, setConfirmDialogOpen ] = useState(false);

	const handleResetClick = () => {
		setConfirmDialogOpen(true);
	};

	const handleConfirmReset = () => {
		update({
			type: "merge",
			data: {
				columns: 25,
				rows: 25,
				tw: 32,
				th: 32,
				sw: 1,
				sh: 1,
				offsetX: 0,
				offsetY: 0,
				width: 800,
				height: 800,
				autoSize: true,
			},
		});

		setConfirmDialogOpen(false);
	};

	const handleCancelReset = () => {
		setConfirmDialogOpen(false);
	};

	return (
		<>
			<button
				type="button"
				className={ `w-full p-1 ml-2 text-xs border-solid rounded border bg-white text-gray-400 border-gray-300 hover:bg-sky-100 hover:text-sky-500 hover:border-sky-300` }
				onClick={ handleResetClick }
			>
				Reset to Default
			</button>

			{/* Confirmation Dialog */ }
			{ confirmDialogOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="p-4 bg-white rounded-lg shadow-lg">
						<p>Are you sure you want to reset to default?</p>
						<div className="flex justify-end mt-4">
							<button
								type="button"
								className="px-3 py-1 mr-2 text-xs bg-gray-300 rounded hover:bg-gray-400 focus:outline-none"
								onClick={ handleCancelReset }
							>
								Cancel
							</button>
							<button
								type="button"
								className="px-3 py-1 text-xs text-white rounded bg-sky-500 hover:bg-sky-600 focus:outline-none"
								onClick={ handleConfirmReset }
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			) }
		</>
	);
};

export function TileMapSizing({ data, update }) {
	return (
		<div className="p-2 border border-solid rounded select-none bg-neutral-50 border-neutral-200">
			<div
				className="flex flex-row gap-2 mb-1"
				title="Columns x Rows"
			>
				<BsGrid3X3 className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 text-center">
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.columns }
						onChange={ (e) => update({
							type: "resize",
							data: [ +e.target.value, data.rows ],
						}) }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.rows }
						onChange={ (e) => update({
							type: "resize",
							data: [ data.columns, +e.target.value ],
						}) }
					/>
				</div>
			</div>

			<div
				className="flex flex-row gap-2 mb-1"
				title="Tile Width x Tile Height"
			>
				<BsBoundingBox className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 text-center">
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.tw }
						onChange={ (e) => update({
							type: "resizeTile",
							data: [ +e.target.value, data.th ],
						}) }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.th }
						onChange={ (e) => update({
							type: "resizeTile",
							data: [ data.tw, +e.target.value ],
						}) }
					/>
				</div>
			</div>

			<div
				className="flex flex-row gap-2 mb-1"
				title="Canvas Width x Canvas Height"
			>
				<BsEasel className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 w-5/6 text-center">
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.width }
						onChange={ (e) => update({
							type: "resizeCanvas",
							data: [ +e.target.value, data.height ],
						}) }
						disabled={ data.autoSize }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.height }
						onChange={ (e) => update({
							type: "resizeCanvas",
							data: [ data.width, +e.target.value ],
						}) }
						disabled={ data.autoSize }
					/>
				</div>
				<div className="flex flex-row items-center w-1/6">
					<button
						type="button"
						className={ `w-full p-1 ml-2 text-xs border-solid rounded border ${ data.autoSize ? "border-sky-300 text-sky-400 bg-sky-50 hover:bg-neutral-50 hover:text-neutral-500 hover:border-neutral-300" : "bg-white text-gray-400 border-gray-300 hover:bg-sky-100 hover:text-sky-500 hover:border-sky-300" }` }
						onClick={ (e) => update({
							type: "toggleAutoSize",
							data: !data.autoSize
						}) }
					>
						Auto Size
					</button>
				</div>
			</div>

			<div
				className="flex flex-row gap-2 mb-1"
				title="Scale Width x Scale Height"
			>
				<BsAspectRatio className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 w-5/6 text-center">
					<input
						type="number"
						min={ 0.125 }
						max={ 10 }
						step={ 1 }
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.sw }
						onChange={ (e) => {
							const currentValue = +e.target.value;
							const newValue = currentValue < data.sw ? currentValue / 2 : currentValue * 2;
							if(newValue >= 0.125 && newValue <= 10) {
								update({
									type: "resizeScale",
									data: [ newValue, data.sh ],
								})
							}
						} }
						disabled={ true }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						min={ 0.125 }
						max={ 10 }
						step={ 1 }
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.sh }
						onChange={ (e) => {
							const currentValue = +e.target.value;
							const newValue = currentValue < data.sh ? currentValue / 2 : currentValue * 2;
							if(newValue >= 0.125 && newValue <= 10) {
								update({
									type: "resizeScale",
									data: [ data.sw, newValue ],
								})
							}
						} }
						disabled={ true }
					/>

				</div>
				<div className="flex flex-row items-center w-1/6">
					<button
						type="button"
						className="w-full p-1 ml-2 text-xs text-gray-700 bg-white border border-gray-300 border-solid rounded hover:bg-sky-100 hover:text-sky-500 hover:border-sky-300"
						onClick={ (e) => update({
							type: "resizeScale",
							data: [ 1, 1 ]
						}) }
					>
						Reset
					</button>
				</div>
			</div>

			<div
				className="flex flex-row gap-2 mb-1"
				title="Offset X x Offset Y"
			>
				<BsArrowsMove className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 w-5/6 text-center">
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.offsetX }
						onChange={ (e) => update({
							type: "offset",
							data: [ +e.target.value, data.offsetY ],
						}) }
						disabled={ true }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.offsetY }
						onChange={ (e) => update({
							type: "offset",
							data: [ data.offsetX, +e.target.value ],
						}) }
						disabled={ true }
					/>
				</div>
				<div className="flex flex-row items-center w-1/6">
					<button
						type="button"
						className="w-full p-1 ml-2 text-xs text-gray-700 bg-white border border-gray-300 border-solid rounded hover:bg-sky-100 hover:text-sky-500 hover:border-sky-300"
						onClick={ (e) => update({
							type: "offset",
							data: [ 0, 0 ]
						}) }
					>
						Reset
					</button>
				</div>
			</div>

			<div className="flex flex-row gap-2 mt-2">
				<ResetToDefault update={ update } />
			</div>
		</div>
	);
};

export default TileMapSizing;