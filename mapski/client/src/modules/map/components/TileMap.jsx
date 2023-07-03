import { useEffect, useRef, useState } from "react";

export function drawTerrain(canvas, data) {
	const { map: mapData, terrain: terrainData } = data;
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const tileWidthScaled = mapData.tw * mapData.sw;   // apply horizontal scaling
	const tileHeightScaled = mapData.th * mapData.sh;  // apply vertical scaling
	const tileCenterWidthScaled = tileWidthScaled / 2;
	const tileCenterHeightScaled = tileHeightScaled / 2;

	for(let y = 0; y < mapData.rows; y++) {
		for(let x = 0; x < mapData.columns; x++) {
			const tile = mapData.tiles[ y ][ x ];
			const texture = terrainData.terrains[ tile.data ]?.texture;
			const tx = x * tileWidthScaled;
			const ty = y * tileHeightScaled;

			if(texture == null) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
				ctx.fillRect(tx, ty, tileWidthScaled, tileHeightScaled);
				ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
				ctx.fillRect(tx, ty, tileCenterWidthScaled, tileCenterHeightScaled);
				ctx.fillRect(tx + tileCenterWidthScaled, ty + tileCenterHeightScaled, tileCenterWidthScaled, tileCenterHeightScaled);
			} else if(typeof texture === "string") {
				ctx.fillStyle = texture;    // Color
				ctx.fillRect(tx, ty, tileWidthScaled, tileHeightScaled);
			} else if(texture instanceof HTMLCanvasElement || texture instanceof HTMLImageElement) {
				ctx.drawImage(texture, 0, 0, tileWidthScaled, tileHeightScaled, tx, ty, tileWidthScaled, tileHeightScaled);
			}
		}
	}
};


export function TileMap({ data, update }) {
	const { map: mapData, terrain: terrainData, brushes: brushesData } = data;
	const { mapDispatch, brushesDispatch } = update;
	const canvas = useRef(document.createElement("canvas"));
	const [ render, setRender ] = useState(0);
	const [ e, setLastEvent ] = useState(null);

	useEffect(() => {
		if(!canvas.current) return;

		if(mapData.autoSize) {
			// Autosize canvas based on the tile dimensions, count and scaling
			canvas.current.width = mapData.tw * mapData.columns;
			canvas.current.height = mapData.th * mapData.rows;
		} else {
			// Fixed canvas size
			canvas.current.width = mapData.width;
			canvas.current.height = mapData.height;
		}

		drawTerrain(canvas.current, data);

		setRender(render + 1);
	}, [ canvas.current, mapData ]);



	useEffect(() => {
		if(!e || e.button !== 0) return;
		const { sw, sh, columns, rows } = mapData;  // get map dimensions
		const x = Math.floor(e.offsetX / mapData.tw / sw);
		const y = Math.floor(e.offsetY / mapData.th / sh);
		const bx = brushesData.x;
		const by = brushesData.y;
		let points = Array.isArray(brushesData.brushData) ? brushesData.brushData.map(([ rx, ry ]) => [ rx + bx, ry + by ]) : [ [ bx, by ] ];

		// Break out of the selection if the mouse is released outside of the canvas
		if(e.type === "mouseup" && e.target !== canvas.current) {
			brushesDispatch({
				type: "deselect",
			});
			drawTerrain(canvas.current, data);

			return;
		}

		drawTerrain(canvas.current, data);

		if(typeof brushesData.brushData === "function") {
			if(brushesData.isActive) {
				const [ startX, startY ] = brushesData.special;
				points = brushesData.brushData(startX, startY, x, y);
			} else {
				points = brushesData.brushData(x, y, x, y);
			}
		} else if(!Array.isArray(points)) {
			points = [];
		}

		// Filter points to make sure they are within map boundaries
		points = points.filter(([ tx, ty ]) => tx >= 0 && ty >= 0 && tx < columns && ty < rows);

		// create a semi-transparent red square over each point in points
		for(let [ tx, ty ] of points) {
			const ctx = canvas.current.getContext("2d");
			ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
			ctx.fillRect(sw * tx * mapData.tw, sh * ty * mapData.th, sw * mapData.tw, sh * mapData.th);
		}

		// Create a white line around all edges that don't connect to another point in points
		for(let [ tx, ty ] of points) {
			const ctx = canvas.current.getContext("2d");
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

			const lineWidth = 2; // Desired line width
			if(!points.find(([ px, py ]) => px === tx && py === ty - 1)) {
				ctx.fillRect(
					sw * tx * mapData.tw,
					sh * (ty * mapData.th - lineWidth / 2),
					sw * mapData.tw,
					sh * lineWidth
				);
			}
			if(!points.find(([ px, py ]) => px === tx && py === ty + 1)) {
				ctx.fillRect(
					sw * tx * mapData.tw,
					sh * (ty * mapData.th + mapData.th - lineWidth / 2),
					sw * mapData.tw,
					sh * lineWidth
				);
			}
			if(!points.find(([ px, py ]) => px === tx - 1 && py === ty)) {
				ctx.fillRect(
					sw * (tx * mapData.tw - lineWidth / 2),
					sh * ty * mapData.th,
					sw * lineWidth,
					sh * mapData.th
				);
			}
			if(!points.find(([ px, py ]) => px === tx + 1 && py === ty)) {
				ctx.fillRect(
					sw * (tx * mapData.tw + mapData.tw - lineWidth / 2),
					sh * ty * mapData.th,
					sw * lineWidth,
					sh * mapData.th
				);
			}
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

		if(type === "move" && x === bx && y === by) return;
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
		canvas.current.addEventListener("mouseup", setLastEvent);
		window.addEventListener("mouseup", setLastEvent);
		canvas.current.addEventListener("mouseout", setLastEvent);
		canvas.current.addEventListener("mouseenter", setLastEvent);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("mousemove", setLastEvent);
			canvas.current.removeEventListener("mousedown", setLastEvent);
			canvas.current.removeEventListener("mouseup", setLastEvent);
			window.removeEventListener("mouseup", setLastEvent);
			canvas.current.removeEventListener("mouseout", setLastEvent);
			canvas.current.removeEventListener("mouseenter", setLastEvent);
		};
	}, [ canvas.current, setLastEvent ]);

	useEffect(() => {
		const handleScroll = (e) => {
			e.preventDefault();

			if(e.ctrlKey) {
				if(e.deltaY < 0) {
					// Zoom in
					mapDispatch({
						type: "resizeScale",
						data: [ mapData.sw * 2, mapData.sh * 2 ],
					});
				} else {
					// Zoom out
					mapDispatch({
						type: "resizeScale",
						data: [ mapData.sw / 2, mapData.sh / 2 ],
					});
				}
			}
		};

		if(!canvas.current) return;

		canvas.current.addEventListener("wheel", handleScroll);

		return () => {
			if(!canvas.current) return;
			canvas.current.removeEventListener("wheel", handleScroll);
		};
	}, [ canvas.current, mapDispatch, mapData.sw, mapData.sh ]);


	return (
		<div
			className="p-1 border border-solid rounded shadow border-neutral-200 bg-neutral-50"
			title="Ctrl+Zoom: Double/Half scale"
		>
			<canvas
				ref={ canvas }
			/>
		</div>
	);
};

export default TileMap;