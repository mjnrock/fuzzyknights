import { useEffect, useRef, useState } from "react";

export function drawTerrain(canvas, data, ignoreScale = false) {
	const { map: mapData, terrain: terrainData } = data;
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	const tileWidthScaled = mapData.tw * (ignoreScale ? 1 : mapData.sw);   // apply horizontal scaling
	const tileHeightScaled = mapData.th * (ignoreScale ? 1 : mapData.sh);  // apply vertical scaling
	const tileCenterWidthScaled = tileWidthScaled / 2;
	const tileCenterHeightScaled = tileHeightScaled / 2;

	for(let y = 0; y < mapData.rows; y++) {
		for(let x = 0; x < mapData.columns; x++) {
			const tile = mapData.tiles[ y ][ x ];
			const texture = terrainData.terrains[ tile.data ]?.texture;
			const tx = x * tileWidthScaled - mapData.offsetX;   // Apply panning offset
			const ty = y * tileHeightScaled - mapData.offsetY;  // Apply panning offset


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
		const { sw, sh, columns, rows, offsetX, offsetY, startX, startY } = mapData;  // get map dimensions
		//NOTE: There's a render speed bugfix here that the "isActive" check resolves
		const x = ~~(e.offsetX / mapData.tw / sw) + ((brushesData.isActive && brushesData.brush === "pan") ? 0 : ~~(offsetX / mapData.tw / sw));
		const y = ~~(e.offsetY / mapData.th / sh) + ((brushesData.isActive && brushesData.brush === "pan") ? 0 : ~~(offsetY / mapData.th / sh));
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

		// Create context only once
		const ctx = canvas.current.getContext("2d");

		// Calculate common values only once
		const commonWidth = sw * mapData.tw;
		const commonHeight = sh * mapData.th;
		const lineWidth = 2; // Desired line width
		const halfLineWidthSh = sh * lineWidth / 2;
		const lineWidthSw = sw * lineWidth;

		for(let [ tx, ty ] of points) {
			// Calculate the scaled width and height at the beginning
			const scaledWidth = (sw * tx * mapData.tw) - (commonWidth * ~~(offsetX / commonWidth));
			const scaledHeight = (sh * ty * mapData.th) - (commonHeight * ~~(offsetY / commonHeight));

			// Draw a semi-transparent red square over each point
			ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
			ctx.fillRect(scaledWidth, scaledHeight, commonWidth, commonHeight);

			// Draw a white line around all edges that don't connect to another point
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

			if(!points.find(([ px, py ]) => px === tx && py === ty - 1)) {
				ctx.fillRect(scaledWidth, scaledHeight - halfLineWidthSh, commonWidth, halfLineWidthSh);
			}
			if(!points.find(([ px, py ]) => px === tx && py === ty + 1)) {
				ctx.fillRect(scaledWidth, scaledHeight + commonHeight - halfLineWidthSh, commonWidth, halfLineWidthSh);
			}
			if(!points.find(([ px, py ]) => px === tx - 1 && py === ty)) {
				ctx.fillRect(scaledWidth - lineWidthSw / 2, scaledHeight, lineWidthSw, commonHeight);
			}
			if(!points.find(([ px, py ]) => px === tx + 1 && py === ty)) {
				ctx.fillRect(scaledWidth + commonWidth - lineWidthSw / 2, scaledHeight, lineWidthSw, commonHeight);
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

		if(x < 0 || x >= mapData.columns || y < 0 || y >= mapData.rows) {
			if(brushesData.brush === "pan") {
				// Pan outside of map boundaries
				// NOOP
			} else {
				return;
			}
		}

		const ox = ~~(e.offsetX / mapData.tw / sw);
		const oy = ~~(e.offsetY / mapData.th / sh);

		brushesDispatch({
			type,
			data: {
				x: brushesData.brush === "pan" ? ox : x,
				y: brushesData.brush === "pan" ? oy : y,
				deltaX: x - bx,
				deltaY: y - by,
			},
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
			if(e.ctrlKey) {
				e.preventDefault();
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
			className={ `p-1 border border-solid rounded shadow border-neutral-200 bg-neutral-50 ` + (brushesData.brush === "pan" ? (brushesData.isActive ? "cursor-grabbing" : "cursor-grab") : "cursor-crosshair") }
			title="Ctrl+Zoom: Double/Half scale"
		>
			<canvas
				ref={ canvas }
			/>
		</div>
	);
};


export function TileMapPreview({ data, width = 320, height = 320 }) {
	const { map: mapData } = data;
	const canvas = useRef(document.createElement("canvas"));

	useEffect(() => {
		if(!canvas.current) return;

		canvas.current.width = mapData.width;
		canvas.current.height = mapData.height;

		drawTerrain(canvas.current, data, true);
	}, [ canvas.current, mapData ]);

	return (
		<div className="flex flex-row items-center justify-center w-full gap-2">
			<canvas ref={ canvas } style={ { width, height } } />
		</div>
	);
};

export default TileMap;