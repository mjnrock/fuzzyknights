import React from "react";
import { useModule } from "../../../lib/ReactModule.js";

import { EnumActions as EnumBrushesActions } from "../../brushes/main.js";

export function Canvas({ module, textures, tiles = [ 64, 64 ], ...props }) {
	const { state } = useModule(module);

	const canvas = React.useRef(document.createElement("canvas"));
	const [ tw, th ] = Array.isArray(tiles) ? tiles : [ tiles, tiles ];

	const drawTerrain = (state) => {
		const ctx = canvas.current.getContext("2d");
		for(let row = 0; row < state.rows; row++) {
			for(let column = 0; column < state.columns; column++) {
				const x = column * tw;
				const y = row * th;

				const data = state.getTile(column, row).data;
				if(data === null) {
					ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
					ctx.fillRect(x, y, tw, th);
					ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
					ctx.fillRect(x, y, tw / 2, th / 2);
					ctx.fillRect(x + tw / 2, y + th / 2, tw / 2, th / 2);
				} else {
					ctx.fillStyle = textures[ data ];
					ctx.fillRect(x, y, tw, th);
				}
			}
		}
	};

	const onMouseEvent = (e, type) => {
		const x = Math.floor(e.offsetX / tw);
		const y = Math.floor(e.offsetY / th);
		const cx = module.$query("brushes", "x");
		const cy = module.$query("brushes", "y");

		if(type === EnumBrushesActions.MOVE && x === cx && y === cy) return;
		if(type === EnumBrushesActions.UP && e.buttons) return;

		if(x < 0 || x >= state.columns || y < 0 || y >= state.rows) return;

		if(type === EnumBrushesActions.DOWN) {
			console.log(state.getTile(x, y));
		}

		module.$dispatch("brushes", { type, x, y });
	};
	const onMouseMove = (e) => {
		if(Array.isArray(module.$query("brushes", "special"))) {
			const [ , sx, sy ] = module.$query("brushes", "special");

			drawTerrain(state);

			const ctx = canvas.current.getContext("2d");
			ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

			let startX, startY, rectWidth, rectHeight;

			if(sx > e.offsetX / tw) { // Mouse moving left
				startX = Math.floor(e.offsetX / tw) * tw;
				rectWidth = (sx - Math.floor(e.offsetX / tw)) * tw;
			} else { // Mouse moving right
				startX = sx * tw;
				rectWidth = Math.ceil((e.offsetX / tw - sx)) * tw;
			}

			if(sy > e.offsetY / th) { // Mouse moving up
				startY = Math.floor(e.offsetY / th) * th;
				rectHeight = (sy - Math.floor(e.offsetY / th)) * th;
			} else { // Mouse moving down
				startY = sy * th;
				rectHeight = Math.ceil((e.offsetY / th - sy)) * th;
			}

			ctx.fillRect(startX, startY, rectWidth, rectHeight);

		}

		onMouseEvent(e, EnumBrushesActions.MOVE);
	};
	const onMouseDown = (e) => onMouseEvent(e, EnumBrushesActions.DOWN);
	const onMouseUp = (e) => onMouseEvent(e, EnumBrushesActions.UP);

	React.useEffect(() => {
		if(!canvas.current) return;
		canvas.current.addEventListener("mousemove", onMouseMove);
		canvas.current.addEventListener("mousedown", onMouseMove);
		canvas.current.addEventListener("mousedown", onMouseDown);
		canvas.current.addEventListener("mouseup", onMouseUp);
		canvas.current.addEventListener("mouseout", onMouseUp);
		canvas.current.addEventListener("mouseenter", onMouseUp);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", onMouseMove);
			canvas.current.removeEventListener("mousedown", onMouseMove);
			canvas.current.removeEventListener("mousedown", onMouseDown);
			canvas.current.removeEventListener("mouseup", onMouseUp);
			canvas.current.removeEventListener("mouseout", onMouseUp);
			canvas.current.removeEventListener("mouseenter", onMouseUp);
		};
	}, [ canvas.current ]);

	React.useEffect(() => {
		canvas.current.width = tw * state.columns;
		canvas.current.height = th * state.rows;

		drawTerrain(state);
	}, [ state, tiles ]);

	return (
		<canvas
			ref={ canvas }
			{ ...props }
		/>
	);
};

export default Canvas;