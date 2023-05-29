import React from "react";
import { MapModuleReact } from "../main";

import { NetworkContext } from "../../../routes/Editor.jsx";

import { TextureMap } from "../../../data/stub/EnumTerrainType.js";;

export function Canvas({ module, state, dispatch }) {
	const network = React.useContext(NetworkContext);
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
					data: network.execute("terrain", "state", [ "selected" ]),
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

export function Map({ ...props }) {
	const { module, state, dispatch, emit } = MapModuleReact.useModule();

	// console.log(state);

	return (
		<div className="p-2 m-2 bg-neutral-50 border border-solid rounded border-neutral-200 flex flex-row items-center justify-center" { ...props }>
			<div className="flex flex-col">
				<div
					className="p-2 bg-gray-500 text-white text-center cursor-pointer mb-2"
					onClick={ () => {
						dispatch({
							type: "RANDOMIZE"
						});
					} }
				>
					Randomize Seed
				</div>
				<Canvas
					width={ 600 }
					height={ 600 }
					state={ state }
					dispatch={ dispatch }
					module={ module }
				/>
			</div>
		</div>
	);
};

export default Map;