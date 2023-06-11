import { useRef } from "react";

import { Base64 } from "../../../util/Base64";
import { Canvas } from "../../../components/Canvas";

export const TerrainPreview = ({ terrain, colorHandler, imageHandler }) => {
	const fileInputRef = useRef();

	// const handleColorClick = (e) => {
	// 	e.target.type = "color";
	// 	e.target.onchange = () => {
	// 		colorHandler(e.target.value);
	// 		e.target.type = "";
	// 	};
	// 	e.target.click();
	// };

	const handleCanvasClick = (e) => {
		e.preventDefault();

		fileInputRef.current.click();
	};

	const handleFileChange = (e) => {
		const file = e.target.files[ 0 ];
		if(file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				if(Base64.test(e.target.result)) {
					Base64.Decode(e.target.result).then((image) => {
						imageHandler(image);
					});
				}
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<>
			<input
				type="file"
				ref={ fileInputRef }
				style={ { display: "none" } }
				accept="image/*"
				onChange={ handleFileChange }
			/>
			{ typeof terrain.texture === "string" ? (
				<div
					className="w-16 h-16 m-2 border border-gray-800 border-solid rounded cursor-pointer"
					style={ { backgroundColor: terrain.texture } }
					onContextMenu={ handleCanvasClick }
					title="Right-Click preview box to change texture"
				/>
			) : (
				<Canvas
					source={ terrain.texture }
					width={ 64 }
					height={ 64 }
					className="m-2 border border-solid rounded cursor-pointer border-neutral-200 hover:border-neutral-300"
					onContextMenu={ handleCanvasClick }
					title="Right-Click preview box to change texture"
				/>
			) }
		</>
	);
};

export default TerrainPreview;