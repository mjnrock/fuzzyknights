import { useRef, useEffect } from "react";
import { useModule } from "../../../lib/ReactModule.js";

import { EnumActions as EnumBrushesActions } from "../../brushes/main.js";

export function TerrainCanvas({ module, terrains, ...props }) {
	useModule(module);
	const canvas = useRef(document.createElement("canvas"));

	const drawTerrain = () => {
		const ctx = canvas.current.getContext("2d");

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

		for(let row = 0; row < module.state.rows; row++) {
			for(let column = 0; column < module.state.columns; column++) {
				const x = column * module.state.tw;
				const y = row * module.state.th;

				const data = module.state.getTile(column, row).data;
				if(data === null) {
					ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
					ctx.fillRect(x, y, module.state.tw, module.state.th);
					ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
					ctx.fillRect(x, y, module.state.tw / 2, module.state.th / 2);
					ctx.fillRect(x + module.state.tw / 2, y + module.state.th / 2, module.state.tw / 2, module.state.th / 2);
				} else {
					ctx.fillStyle = terrains[ data ];
					ctx.fillRect(x, y, module.state.tw, module.state.th);
				}
			}
		}
	};

	const onMouseEvent = (e) => {
		const x = Math.floor(e.offsetX / module.state.tw);
		const y = Math.floor(e.offsetY / module.state.th);
		const cx = module.$query("brushes", "x");
		const cy = module.$query("brushes", "y");

		if(Array.isArray(module.$query("brushes", "special"))) {
			const [ , sx, sy ] = module.$query("brushes", "special");
			const tx = e.offsetX / module.state.tw;
			const ty = e.offsetY / module.state.th;

			if(
				(e.type === "mouseup" && e.target !== canvas.current)	// Break out of the selection if the mouse is released outside of the canvas
				|| (e.type === "mouseup" && x === sx && y === sy)		// Ignore selection if the mouse hasn't moved tiles
			) {
				drawTerrain();
				module.$dispatch("brushes", { type: EnumBrushesActions.DESELECT });
				return;
			}

			let startX, startY, rectWidth, rectHeight;

			if(sx > tx) { // Mouse moving left
				startX = Math.floor(tx) * module.state.tw;
				rectWidth = (Math.ceil(sx) - Math.floor(tx) + 1) * module.state.tw;
			} else { // Mouse moving right
				startX = Math.floor(sx * module.state.tw);
				rectWidth = (Math.ceil(tx) - sx) * module.state.tw;
			}

			if(sy > ty) { // Mouse moving up
				startY = Math.floor(ty) * module.state.th;
				rectHeight = (Math.ceil(sy) - Math.floor(ty) + 1) * module.state.th;
			} else { // Mouse moving down
				startY = Math.floor(sy * module.state.th);
				rectHeight = (Math.ceil(ty) - sy) * module.state.th;
			}

			const ctx = canvas.current.getContext("2d");
			drawTerrain();
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

		if(type === EnumBrushesActions.MOVE && x === cx && y === cy) return;
		if(type === EnumBrushesActions.UP && e.buttons) return;
		if(x < 0 || x >= module.state.columns || y < 0 || y >= module.state.rows) return;

		module.$dispatch("brushes", { type, x, y });
		drawTerrain();
	};

	useEffect(() => {
		if(!canvas.current) return;
		canvas.current.addEventListener("mousemove", onMouseEvent);
		canvas.current.addEventListener("mousedown", onMouseEvent);
		canvas.current.addEventListener("mousedown", onMouseEvent);
		window.addEventListener("mouseup", onMouseEvent);
		canvas.current.addEventListener("mouseout", onMouseEvent);
		canvas.current.addEventListener("mouseenter", onMouseEvent);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", onMouseEvent);
			canvas.current.removeEventListener("mousedown", onMouseEvent);
			canvas.current.removeEventListener("mousedown", onMouseEvent);
			window.removeEventListener("mouseup", onMouseEvent);
			canvas.current.removeEventListener("mouseout", onMouseEvent);
			canvas.current.removeEventListener("mouseenter", onMouseEvent);
		};
	}, [ canvas.current ]);

	useEffect(() => {
		canvas.current.width = module.state.tw * module.state.columns;
		canvas.current.height = module.state.th * module.state.rows;

		drawTerrain();
	}, [ module.state ]);

	return (
		<canvas
			ref={ canvas }
			{ ...props }
		/>
	);
};

export default TerrainCanvas;