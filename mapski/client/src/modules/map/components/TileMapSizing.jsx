import { BsEasel, BsBoundingBoxCircles, BsAspectRatio, BsArrowsAngleExpand } from "react-icons/bs";

export function TileMapSizing({ data, update }) {
	return (
		<div className="p-2 border border-solid rounded select-none bg-neutral-50 border-neutral-200">
			<div className="flex flex-row gap-2 mb-1">
				<BsEasel className="m-auto text-2xl text-gray-400" />
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

			<div className="flex flex-row gap-2 mb-1">
				<BsBoundingBoxCircles className="m-auto text-2xl text-gray-400" />
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

			<div className="flex flex-row gap-2 mb-1">
				<BsAspectRatio className="m-auto text-2xl text-gray-400" />
				<div className="flex flex-row flex-1 w-5/6 text-center">
					<input
						type="number"
						min={ 0.1 }
						max={ 10 }
						step={ 0.1 }
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.sw }
						onChange={ (e) => update({
							type: "resizeScale",
							data: [ +e.target.value, data.sh ],
						}) }
					/>
					<div className="m-auto font-mono text-xs text-gray-400">&nbsp;x&nbsp;</div>
					<input
						type="number"
						min={ 0.1 }
						max={ 10 }
						step={ 0.1 }
						className="w-full p-2 text-center border border-gray-300 border-solid rounded"
						value={ data.sh }
						onChange={ (e) => update({
							type: "resizeScale",
							data: [ data.sw, +e.target.value ],
						}) }
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

			<div className="flex flex-row gap-2 mb-1">
				<BsArrowsAngleExpand className="m-auto text-2xl text-gray-400" />
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
		</div>
	);
};

export default TileMapSizing;