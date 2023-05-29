import React from "react";
import { MapModuleReact } from "../main";

export function Canvas({ width, height, state }) {
	const canvas = React.useRef(document.createElement("canvas"));

	React.useEffect(() => {
		canvas.current.width = width;
		canvas.current.height = height;

		const ctx = canvas.current.getContext("2d");

		const { rows, columns } = state;
		
		for (let row = 0; row < rows; row++) {
			for (let column = 0; column < columns; column++) {
				const x = column * 32;
				const y = row * 32;
				
				ctx.fillStyle = `rgb(${ Math.floor(Math.random() * 255) }, ${ Math.floor(Math.random() * 255) }, ${ Math.floor(Math.random() * 255) })`;
				ctx.fillRect(x, y, 32, 32);
			}
		}

	}, [ width, height, state ]);

	return (
		<canvas ref={ canvas } />
	);
};

export function Map() {
	const { state, dispatch, emit } = MapModuleReact.useModule();

	return (
		<div className="map">
			<div
				className="p-2 bg-blue-500 text-white"
				onClick={ () => {
					dispatch();
				} }
			>
				Click Me
			</div>
			<div>{ JSON.stringify(state) }</div>
			<Canvas
				width={ 600 }
				height={ 600 }
				state={ state }
			/>
		</div>
	);
};

export default Map;