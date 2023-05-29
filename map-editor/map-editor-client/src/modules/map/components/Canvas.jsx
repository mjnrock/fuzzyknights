import React from "react";
import { MapModuleReact, EnumActions } from "../main.js";

export function Canvas({ textures, ...props }) {
	const { state, dispatch, network } = MapModuleReact.useModule();
	const canvas = React.useRef(document.createElement("canvas"));
	const tw = 64;
	const th = 64;

	const onMouseMove = (e) => {
		if(e.buttons !== 1) return;

		const x = Math.floor(e.offsetX / tw);
		const y = Math.floor(e.offsetY / th);

		if(x < 0 || x >= state.columns) return;
		if(y < 0 || y >= state.rows) return;

		const data = network.execute("terrain", "state", [ "selected" ]);
		const current = network.execute("map", "state", [ "tiles", y, x, "data" ]);
		if(current === data) return;

		dispatch({
			type: EnumActions.SET_TILE_DATA,
			data: {
				x,
				y,
				data,
			},
		});
	};

	React.useEffect(() => {
		if(!canvas.current) return;
		canvas.current.addEventListener("mousemove", onMouseMove);
		canvas.current.addEventListener("mousedown", onMouseMove);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", onMouseMove);
			canvas.current.removeEventListener("mousedown", onMouseMove);
		};
	}, [ canvas.current ]);

	React.useEffect(() => {
		canvas.current.width = tw * state.columns;
		canvas.current.height = th * state.rows;

		const ctx = canvas.current.getContext("2d");
		for(let row = 0; row < state.rows; row++) {
			for(let column = 0; column < state.columns; column++) {
				const x = column * tw;
				const y = row * th;

				ctx.fillStyle = textures[ state.getTile(column, row).data ];
				ctx.fillRect(x, y, tw, th);
			}
		}

	}, [ state ]);

	return (
		<canvas
			className="cursor-crosshair"
			ref={ canvas }
			{ ...props }
		/>
	);
};

export default Canvas;