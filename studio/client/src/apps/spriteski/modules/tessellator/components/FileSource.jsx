import { useEffect, useRef } from "react";
import { BsEye, BsEyeSlash, BsUiChecks, BsArrowClockwise } from "react-icons/bs";

export function FileSource({ data, update }) {
	const canvasRef = useRef(null);

	const { tessellatorData } = data;
	const { tessellatorDispatch } = update;

	const { preview } = tessellatorData;

	/* Dispatch the source image to the tessellator */
	const handleFile = (e) => {
		const file = e.target.files[ 0 ];
		if(!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = async () => {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext("2d");

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

				tessellatorDispatch({
					type: "setSource",
					data: canvas,
				});
			};
			img.src = e.target.result;
		};

		reader?.readAsDataURL(file);
	};

	/* Draw the tessellation preview */
	useEffect(() => {
		const { source: sourceImage, parameters } = tessellatorData;

		if(!sourceImage) {
			// Draw the text "Please select a file" on the canvas
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");

			ctx.font = "24px sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#ccc";
			ctx.fillText("Please select a file", canvas.width / 2, canvas.height / 2);

			return;
		}

		let sourceRegion = [ parameters.sx, parameters.sy, parameters.sw, parameters.sh ],
			size = [ Math.ceil(parameters.sh / parameters.th), Math.ceil(parameters.sw / parameters.tw) ],
			tileSize = [ parameters.tw, parameters.th ];

		if(preview) {
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvasRef.current.width, canvasRef.current.height);

			const scaleX = canvasRef.current.width / (sourceImage?.width ?? 1);
			const scaleY = canvasRef.current.height / (sourceImage?.height ?? 1);

			// Draw the red rectangles
			ctx.strokeStyle = "red";
			ctx.lineWidth = 1;
			for(let row = 0; row < size[ 0 ]; row++) {
				for(let col = 0; col < size[ 1 ]; col++) {
					ctx.strokeRect(
						(sourceRegion[ 0 ] + col * tileSize[ 0 ]) * scaleX,
						(sourceRegion[ 1 ] + row * tileSize[ 1 ]) * scaleY,
						tileSize[ 0 ] * scaleX,
						tileSize[ 1 ] * scaleY
					);
				}
			}
		} else {
			// Revert the canvas to its original state if preview is turned off
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvasRef.current.width, canvasRef.current.height);
		}
	}, [ tessellatorData.parameters, preview ]);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex flex-row items-start justify-center gap-2">
				<label>
					<canvas
						ref={ canvasRef }
						className="p-2 border border-solid rounded shadow-lg cursor-pointer border-neutral-200 hover:bg-neutral-700 active:bg-neutral-600 bg-neutral-800"
						title="This is only an estimation of the final result. The actual result will be exact to the parameters you set."
					/>
					<input
						type="file"
						className="hidden"
						onChange={ handleFile }
					/>
				</label>

				<div className="flex flex-col items-start justify-center gap-2">
					<button
						className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-400"
						onClick={ () => tessellatorDispatch({ type: "togglePreview" }) }
						title={ preview ? "Hide preview" : "Show preview" }
					>
						{ preview ? <BsEye className="text-emerald-400" /> : <BsEyeSlash className="text-rose-400" /> }
					</button>
					<button
						className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-400"
						onClick={ e => null }
						title="Adjust tessellation parameters"
					>
						<BsUiChecks className="text-lg text-neutral-400" />
					</button>
					<button
						className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer text-neutral-400 hover:text-amber-400 border-neutral-200 hover:bg-amber-50 active:bg-amber-100 hover:border-amber-200"
						onClick={ e => null }
						title="Retessellate (use after modifying tessellation parameters)"
					>
						<BsArrowClockwise className="text-lg" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default FileSource;