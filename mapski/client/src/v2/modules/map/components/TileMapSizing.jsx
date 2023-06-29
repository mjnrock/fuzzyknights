import { BsEasel, BsBoundingBoxCircles } from "react-icons/bs";

export function TileMapSizing({ data, update }) { 
	return (
		<div className="p-2 border border-solid rounded bg-neutral-50 border-neutral-200">
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
		</div>
	);
};

export default TileMapSizing;