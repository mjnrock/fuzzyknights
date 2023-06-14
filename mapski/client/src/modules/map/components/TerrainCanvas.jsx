import { useRef, useEffect } from "react";
import { useModule } from "../../../lib/ReactModule.js";

import { EnumActions as EnumBrushesActions } from "../../brushes/main.js";

export function TerrainCanvas({ node, ...props }) {
	useModule(node);
	const canvas = useRef(document.createElement("canvas"));

	const drawTerrain = () => {
		const terrains = node.$query("terrain", "terrains");
		const ctx = canvas.current.getContext("2d");

		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);

		for(let row = 0; row < node.state.rows; row++) {
			for(let column = 0; column < node.state.columns; column++) {
				const x = column * node.state.tw;
				const y = row * node.state.th;

				const data = node.state.getTile(column, row).data;
				if(data == null) {
					ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
					ctx.fillRect(x, y, node.state.tw, node.state.th);
					ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
					ctx.fillRect(x, y, node.state.tw / 2, node.state.th / 2);
					ctx.fillRect(x + node.state.tw / 2, y + node.state.th / 2, node.state.tw / 2, node.state.th / 2);
				} else {
					const texture = terrains[ data ].texture;
					if(typeof texture === "string") {
						// texture is a color
						ctx.fillStyle = texture;
						ctx.fillRect(x, y, node.state.tw, node.state.th);
					} else {
						// texture is a canvas
						ctx.drawImage(texture, 0, 0, Math.min(texture.width, node.state.tw), Math.min(texture.height, node.state.th), x, y, node.state.tw, node.state.th);
					}
				}
			}
		}
	};

	const onMouseEvent = (e) => {
		const x = Math.floor(e.offsetX / node.state.tw);
		const y = Math.floor(e.offsetY / node.state.th);
		const cx = node.$query("brushes", "x");
		const cy = node.$query("brushes", "y");

		if(Array.isArray(node.$query("brushes", "special"))) {
			const [ , sx, sy ] = node.$query("brushes", "special");
			const tx = e.offsetX / node.state.tw;
			const ty = e.offsetY / node.state.th;

			if(
				(e.type === "mouseup" && e.target !== canvas.current)	// Break out of the selection if the mouse is released outside of the canvas
				|| (e.type === "mouseup" && x === sx && y === sy)		// Ignore selection if the mouse hasn't moved tiles
			) {
				drawTerrain();
				node.$dispatch("brushes", { type: EnumBrushesActions.DESELECT });
				return;
			}

			let startX, startY, rectWidth, rectHeight;

			if(sx > tx) { // Mouse moving left
				startX = Math.floor(tx) * node.state.tw;
				rectWidth = (Math.ceil(sx) - Math.floor(tx) + 1) * node.state.tw;
			} else { // Mouse moving right
				startX = Math.floor(sx * node.state.tw);
				rectWidth = (Math.ceil(tx) - sx) * node.state.tw;
			}

			if(sy > ty) { // Mouse moving up
				startY = Math.floor(ty) * node.state.th;
				rectHeight = (Math.ceil(sy) - Math.floor(ty) + 1) * node.state.th;
			} else { // Mouse moving down
				startY = Math.floor(sy * node.state.th);
				rectHeight = (Math.ceil(ty) - sy) * node.state.th;
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
		if(x < 0 || x >= node.state.columns || y < 0 || y >= node.state.rows) return;

		node.$dispatch("brushes", { type, x, y });
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
		canvas.current.width = node.state.tw * node.state.columns;
		canvas.current.height = node.state.th * node.state.rows;

		drawTerrain();
	}, [ node.state ]);

	return (
		<div className="p-2 m-2 border border-solid rounded bg-neutral-100 border-neutral-200">
			<canvas
				ref={ canvas }
				{ ...props }
			/>
		</div>
	);
};

export default TerrainCanvas;