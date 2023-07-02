import { useRef, useState } from "react";
import { PhotoshopPicker } from "react-color";

import { Base64 } from "../../../util/Base64";
import { Canvas } from "../../../components/Canvas";

export const TerrainPreview = ({ terrain, colorHandler, imageHandler }) => {
	const fileInputRef = useRef();
	const [ colorPickerVisible, setColorPickerVisible ] = useState(false);
	const [ selectedColor, setSelectedColor ] = useState("#000");

	const handleColorPickerChange = (color) => {
		if(color && color.hex) {
			setSelectedColor(color.hex);
		}
	};
	const handleColorPickerConfirm = () => {
		colorHandler(selectedColor);
		setColorPickerVisible(false);
	};

	const handleColorClick = () => {
		setColorPickerVisible(true);
	};

	const handleCanvasClick = () => {
		fileInputRef.current.click();
	};

	const handleMouseDown = (e) => {
		e.preventDefault();

		if(e.ctrlKey) {
			if(e.button === 0) {
				handleCanvasClick();
			} else if(e.button === 2) {
				handleColorClick();
			}
		}
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
				className="hidden"
				accept="image/*"
				onChange={ handleFileChange }
			/>
			{ colorPickerVisible && (
				<div className="fixed inset-0 z-50 flex items-center justify-center" onContextMenu={ e => e.preventDefault() }>
					<div className="fixed inset-0 bg-black opacity-50" />
					<div className="z-50">
						<PhotoshopPicker
							color={ selectedColor }
							onChange={ handleColorPickerChange }
							onAccept={ () => handleColorPickerConfirm() }
							onCancel={ () => setColorPickerVisible(false) }
						/>
					</div>
				</div>
			) }
			{ typeof terrain.texture === "string" ? (
				<div
					className="w-16 h-16 m-2 border border-gray-800 border-solid rounded cursor-pointer"
					style={ { backgroundColor: terrain.texture } }
					onContextMenu={ e => e.preventDefault() }
					onMouseDown={ handleMouseDown }
					title="Ctrl+Left: Change texture | Ctrl+Right: Change color"
				/>
			) : (
				<Canvas
					className="m-2 border border-solid rounded cursor-pointer border-neutral-200 hover:border-neutral-300"
					source={ terrain.texture }
					width={ 64 }
					height={ 64 }
					onContextMenu={ e => e.preventDefault() }
					onMouseDown={ handleMouseDown }
					title="Ctrl+Left: Change texture | Ctrl+Right: Change color"
				/>
			) }
		</>
	);
};

export default TerrainPreview;