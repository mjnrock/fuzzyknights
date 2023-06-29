import { useEffect, useRef, useState } from "react";

export function drawTerrain(canvas, data) {
	const ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(let y = 0; y < data.map.rows; y++) {
		for(let x = 0; x < data.map.columns; x++) {
			const tile = data.map.tiles[ y ][ x ];
			const texture = data.terrain.terrains[ tile.data ].texture;

			if(typeof texture === "string") {
				ctx.fillStyle = texture;
				ctx.fillRect(x * data.map.tw, y * data.map.th, data.map.tw, data.map.th);
			} else if(texture instanceof HTMLCanvasElement) {
				// Assumes the image is tesselated to the same size as tw/th
				ctx.drawImage(texture, 0, 0, data.map.tw, data.map.th, x * data.map.tw, y * data.map.th, data.map.tw, data.map.th);
				// Draws entire image to the tile, stretched as needed
				// ctx.drawImage(texture, x * data.map.tw, y * data.map.th, data.map.tw, data.map.th);
			}
		}
	}
};

export function TileMap({ data }) {
	const canvas = useRef(document.createElement("canvas"));
	const [ render, setRender ] = useState(0);

	useEffect(() => {
		if(!canvas.current) return;

		canvas.current.width = data.map.tw * data.map.columns;
		canvas.current.height = data.map.th * data.map.rows;

		drawTerrain(canvas.current, data);

		setRender(render + 1);
	}, [ canvas.current, data ]);

	return (
		<>
			<canvas ref={ canvas } />
		</>
	);
};

export default TileMap;