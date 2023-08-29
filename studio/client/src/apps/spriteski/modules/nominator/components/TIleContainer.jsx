import { TileCanvas } from "../../../../../apps/spriteski/modules/tessellator/components/TileCanvas.jsx";

export const TileContainer = ({ current }) => {
	return (
		<>
			{ current.map((record) => {
				const tile = {
					$name: record.Name,
					data: record.Base64,
					width: record.Base64.width,
					height: record.Base64.height,
				};

				return (
					<div
						key={ record.UUID }
						className="flex flex-col items-center justify-center w-32 h-32 p-1 m-1 border border-solid rounded shadow cursor-pointer select-none border-neutral-200 bg-neutral-50 hover:bg-sky-200 active:bg-sky-300 hover:border-sky-200 active:border-sky-300" // Fixed width and height
					>
						<div className="flex items-center justify-center w-full h-full">
							<TileCanvas
								className="max-w-full max-h-full border border-solid cursor-pointer border-neutral-300 bg-neutral-50"
								tile={ tile }
								width={ tile.width }
								height={ tile.height }
								onClick={ e => navigator.clipboard.writeText(tile.$name) }
							/>
						</div>
						<pre className="w-full text-xs text-center break-words whitespace-normal text-neutral-700">  {/* Word wrapping */ }
							{
								tile.$name && (
									<div className="text-xs text-center text-neutral-700">
										{ tile.$name }
									</div>
								)
							}
						</pre>
					</div>
				);
			}) }
		</>
	);
};
