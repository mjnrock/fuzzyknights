import { useEffect, useRef, useState } from "react";

export function drawTerrain(canvas, data) {
	const { map: mapData, terrain: terrainData } = data;
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(let y = 0; y < mapData.rows; y++) {
		for(let x = 0; x < mapData.columns; x++) {
			const tile = mapData.tiles[ y ][ x ];
			const texture = terrainData.terrains[ tile.data ]?.texture;
			const tx = x * mapData.tw;
			const ty = y * mapData.th;

			if(texture == null) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
				ctx.fillRect(tx, ty, mapData.tw, mapData.th);
				ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
				ctx.fillRect(tx, ty, mapData.tw / 2, mapData.th / 2);
				ctx.fillRect(tx + mapData.tw / 2, ty + mapData.th / 2, mapData.tw / 2, mapData.th / 2);
			} else if(typeof texture === "string") {
				ctx.fillStyle = texture;	// Color
				ctx.fillRect(x * mapData.tw, y * mapData.th, mapData.tw, mapData.th);
			} else if(texture instanceof HTMLCanvasElement || texture instanceof HTMLImageElement) {
				ctx.drawImage(texture, 0, 0, mapData.tw, mapData.th, tx, ty, mapData.tw, mapData.th);
			}
		}
	}
};

export function TileMap({ data, update }) {
	const { map: mapData, terrain: terrainData, brushes: brushesData } = data;
	const { brushesDispatch } = update;
	const canvas = useRef(document.createElement("canvas"));
	const [ render, setRender ] = useState(0);
	const [ e, setLastEvent ] = useState(null);

	useEffect(() => {
		if(!canvas.current) return;

		canvas.current.width = mapData.tw * mapData.columns;
		canvas.current.height = mapData.th * mapData.rows;

		drawTerrain(canvas.current, data);

		setRender(render + 1);
	}, [ canvas.current, mapData ]);

	useEffect(() => {
		if(!e) return;
		const x = Math.floor(e.offsetX / mapData.tw);
		const y = Math.floor(e.offsetY / mapData.th);
		const cx = brushesData.x;
		const cy = brushesData.y;

		if(Array.isArray(brushesData.special)) {
			const [ , sx, sy ] = brushesData.special;
			const tx = e.offsetX / mapData.tw;
			const ty = e.offsetY / mapData.th;

			if(
				(e.type === "mouseup" && e.target !== canvas.current)	// Break out of the selection if the mouse is released outside of the canvas
				|| (e.type === "mouseup" && x === sx && y === sy)		// Ignore selection if the mouse hasn't moved tiles
				|| e.type === "mouseout"
				|| e.type === "mouseenter"
			) {
				brushesDispatch({
					type: "deselect",
					data: true,
				});
				drawTerrain(canvas.current, data);

				return;
			}

			let startX, startY, rectWidth, rectHeight;

			if(sx > tx) { // Mouse moving left
				startX = Math.floor(tx) * mapData.tw;
				rectWidth = (Math.ceil(sx) - Math.floor(tx) + 1) * mapData.tw;
			} else { // Mouse moving right
				startX = Math.floor(sx * mapData.tw);
				rectWidth = (Math.ceil(tx) - sx) * mapData.tw;
			}

			if(sy > ty) { // Mouse moving up
				startY = Math.floor(ty) * mapData.th;
				rectHeight = (Math.ceil(sy) - Math.floor(ty) + 1) * mapData.th;
			} else { // Mouse moving down
				startY = Math.floor(sy * mapData.th);
				rectHeight = (Math.ceil(ty) - sy) * mapData.th;
			}

			const ctx = canvas.current.getContext("2d");
			ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
			ctx.fillRect(startX, startY, rectWidth, rectHeight);
		}

		let type;
		switch(e.type) {
			case "mousemove":
				type = "move";
				break;
			case "mousedown":
				type = "down";
				break;
			case "mouseup":
				type = "up";
				break;
			case "mouseout":
				type = "up";
				break;
			case "mouseenter":
				type = "up";
				break;
			default:
				return;
		}

		if(type === "move" && x === cx && y === cy) return;
		if(type === "up" && e.buttons) return;
		if(x < 0 || x >= mapData.columns || y < 0 || y >= mapData.rows) return;

		brushesDispatch({
			type,
			data: { x, y },
		});
	}, [ e ]);

	useEffect(() => {
		if(!canvas.current) return;
		canvas.current.addEventListener("mousemove", setLastEvent);
		canvas.current.addEventListener("mousedown", setLastEvent);
		canvas.current.addEventListener("mousedown", setLastEvent);
		window.addEventListener("mouseup", setLastEvent);
		canvas.current.addEventListener("mouseout", setLastEvent);
		canvas.current.addEventListener("mouseenter", setLastEvent);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", setLastEvent);
			canvas.current.removeEventListener("mousedown", setLastEvent);
			canvas.current.removeEventListener("mousedown", setLastEvent);
			window.removeEventListener("mouseup", setLastEvent);
			canvas.current.removeEventListener("mouseout", setLastEvent);
			canvas.current.removeEventListener("mouseenter", setLastEvent);
		};
	}, [ canvas.current, setLastEvent ]);

	useEffect(() => {
		canvas.current.width = mapData.tw * mapData.columns;
		canvas.current.height = mapData.th * mapData.rows;

		drawTerrain(canvas.current, data);
	}, [ mapData ]);

	return (
		<>
			<canvas ref={ canvas } />
		</>
	);
};

export default TileMap;