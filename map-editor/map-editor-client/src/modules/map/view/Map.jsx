import React from "react";
import { MapModuleReact } from "../main";

export const TextureMap = {
	0: `rgba(0, 255, 0, 1.0)`,
	1: `rgba(255, 0, 0, 1.0)`,
	2: `rgba(0, 0, 255, 1.0)`,
}

export function Canvas({ module, state, dispatch }) {
	const canvas = React.useRef(document.createElement("canvas"));
	const tw = 64;
	const th = 64;

	React.useEffect(() => {
		const mousemove = (event) => {
			if(event.buttons !== 1) return;

			const x = Math.floor(event.offsetX / tw);
			const y = Math.floor(event.offsetY / th);

			if(x < 0 || x >= state.columns) return;
			if(y < 0 || y >= state.rows) return;

			dispatch({
				type: "SET_TILE_DATA",
				data: {
					x,
					y,
					data: 0,
				},
			});
		};

		canvas.current.addEventListener("mousemove", mousemove);
		canvas.current.addEventListener("mousedown", mousemove);

		return () => {
			canvas.current.removeEventListener("mousemove", mousemove);
			canvas.current.removeEventListener("mousedown", mousemove);
		};
	}, [ canvas.current ]);

	React.useEffect(() => {
		canvas.current.width = tw * state.columns;
		canvas.current.height = th * state.rows;

		const ctx = canvas.current.getContext("2d");

		const { rows, columns } = state;

		for(let row = 0; row < rows; row++) {
			for(let column = 0; column < columns; column++) {
				const x = column * tw;
				const y = row * th;

				ctx.fillStyle = TextureMap[ state.getTile(column, row).data ];
				ctx.fillRect(x, y, tw, th);
			}
		}

	}, [ state ]);

	return (
		<canvas
			className="cursor-crosshair"
			ref={ canvas }
		/>
	);
};

export function Map() {
	const { module, state, dispatch, emit } = MapModuleReact.useModule();

	// console.log(state);

	return (
		<div className="map">
			<div
				className="p-2 bg-blue-500 text-white"
				onClick={ () => {
					dispatch({
						type: "RANDOMIZE"
					});
				} }
			>
				Click Me
			</div>
			<div>{ state.toJson() }</div>
			<Canvas
				width={ 600 }
				height={ 600 }
				state={ state }
				dispatch={ dispatch }
				module={ module }
			/>
		</div>
	);
};

export default Map;