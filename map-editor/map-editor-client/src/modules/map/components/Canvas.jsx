import { useRef, useEffect } from "react";
import { useModule } from "../../../lib/ReactModule.js";

import { EnumActions as EnumBrushesActions } from "../../brushes/main.js";

export function Canvas({ module, textures, tiles = [ 64, 64 ], ...props }) {
	const canvas = useRef(document.createElement("canvas"));
	const { state } = useModule(module);

	const [ tw, th ] = Array.isArray(tiles) ? tiles : [ tiles, tiles ];

	const drawTerrain = () => {
		const ctx = canvas.current.getContext("2d");

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

		for(let row = 0; row < module.state.rows; row++) {
			for(let column = 0; column < module.state.columns; column++) {
				const x = column * tw;
				const y = row * th;

				const data = module.state.getTile(column, row).data;
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

	const onMouseEvent = (e) => {
		if((e.type === "mousemove" || e.type === "mousedown") && Array.isArray(module.$query("brushes", "special"))) {
			const [ , sx, sy ] = module.$query("brushes", "special");
			const tx = e.offsetX / tw;
			const ty = e.offsetY / th;

			let startX, startY, rectWidth, rectHeight;

			if(sx > tx) { // Mouse moving left
				startX = Math.floor(tx) * tw;
				rectWidth = (Math.ceil(sx) - Math.floor(tx) + 1) * tw;
			} else { // Mouse moving right
				startX = Math.floor(sx * tw);
				rectWidth = (Math.ceil(tx) - sx) * tw;
			}

			if(sy > ty) { // Mouse moving up
				startY = Math.floor(ty) * th;
				rectHeight = (Math.ceil(sy) - Math.floor(ty) + 1) * th;
			} else { // Mouse moving down
				startY = Math.floor(sy * th);
				rectHeight = (Math.ceil(ty) - sy) * th;
			}

			drawTerrain();

			const ctx = canvas.current.getContext("2d");
			ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
			ctx.fillRect(startX, startY, rectWidth, rectHeight);
		}

		let type;
		switch(e.type) {
			case "mousemove":
				type = EnumBrushesActions.MOVE;
				break;
			case "mousedown":
				type = EnumBrushesActions.DOWN;
				break;
			case "mouseup":
				type = EnumBrushesActions.UP;
				break;
			case "mouseout":
				type = EnumBrushesActions.UP;
				break;
			case "mouseenter":
				type = EnumBrushesActions.UP;
				break;
			default:
				return;
		}

		const x = Math.floor(e.offsetX / tw);
		const y = Math.floor(e.offsetY / th);
		const cx = module.$query("brushes", "x");
		const cy = module.$query("brushes", "y");

		if(type === EnumBrushesActions.MOVE && x === cx && y === cy) return;
		if(type === EnumBrushesActions.UP && e.buttons) return;

		if(x < 0 || x >= state.columns || y < 0 || y >= state.rows) return;

		module.$dispatch("brushes", { type, x, y });
	};

	useEffect(() => {
		if(!canvas.current) return;
		canvas.current.addEventListener("mousemove", onMouseEvent);
		canvas.current.addEventListener("mousedown", onMouseEvent);
		canvas.current.addEventListener("mousedown", onMouseEvent);
		canvas.current.addEventListener("mouseup", onMouseEvent);
		canvas.current.addEventListener("mouseout", onMouseEvent);
		canvas.current.addEventListener("mouseenter", onMouseEvent);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", onMouseEvent);
			canvas.current.removeEventListener("mousedown", onMouseEvent);
			canvas.current.removeEventListener("mousedown", onMouseEvent);
			canvas.current.removeEventListener("mouseup", onMouseEvent);
			canvas.current.removeEventListener("mouseout", onMouseEvent);
			canvas.current.removeEventListener("mouseenter", onMouseEvent);
		};
	}, [ canvas.current ]);

	useEffect(() => {
		canvas.current.width = tw * state.columns;
		canvas.current.height = th * state.rows;

		drawTerrain();
	}, [ state, tiles ]);

	return (
		<canvas
			ref={ canvas }
			{ ...props }
		/>
	);
};

export default Canvas;