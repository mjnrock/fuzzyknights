import { useRef } from "react";
import { BsEye, BsEyeSlash, BsImage } from "react-icons/bs";

export function FileSource({ data, update }) {
	const canvasRef = useRef(null);

	const { tessellatorData } = data;
	const { tessellatorDispatch } = update;

	const { preview } = tessellatorData;

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

	return (
		<div className="flex flex-col items-center justify-center">
			<h2 className="text-lg italic">File Source</h2>

			<div className="flex flex-row items-center justify-center gap-2">
				<label
					className="p-4 border border-solid rounded shadow cursor-pointer border-sky-200 hover:bg-sky-50 active:bg-sky-100 text-sky-400"
				>
					<BsImage />
					<input
						type="file"
						className="hidden"
						onChange={ handleFile }
					/>
				</label>

				<button
					className="flex flex-col items-center justify-center p-4 border border-solid rounded shadow cursor-pointer border-neutral-200 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-400"
					onClick={ () => tessellatorDispatch({ type: "togglePreview" }) }
				>
					{ preview ? <BsEyeSlash /> : <BsEye /> }
				</button>
			</div>

			<div className="flex flex-col items-center justify-center">
				<canvas
					ref={ canvasRef }
					className="p-1 m-2 border border-solid rounded shadow border-neutral-200"
				/>
			</div>
		</div>
	);
};

export default FileSource;